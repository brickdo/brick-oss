/**
 * Copyright (C) 2025 Monadfix OÜ
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  TreeRepository,
  IsNull,
  Not,
  Like,
  Equal,
  Connection,
  FindOneOptions,
  In,
  Repository,
  FindManyOptions,
  Raw,
  EntityManager,
} from 'typeorm'
import { moveArrayItem } from '@brick/utils'
import {
  Workspace,
  Page,
  User,
  PageUserCollaboration,
  PublicAddress,
  PageRepository,
  PageCustomHeadTag,
  SimilarTo,
} from '@app/db'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { htmlToText } from 'html-to-text'
import { escape, now } from 'lodash'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'
import { renderScss } from '@brick/lib/scss'
import { extractShortPageId, generateShortPageId } from '@brick/utils/randomId'
import { CollaborationService } from '@brick/collaboration/collaboration.service'
import { FrontendSocketGateway } from '@brick/frontend/frontend.socket.gateway'
import { canRolePerformPageAction, PageAction, UserPageRole } from './page.auth.rules'
import { isUUID } from 'class-validator'
import { UserService } from '@brick/user/user.service'
import { SubscriptionPlans } from '@brick/misc/constants/subscription'
import { PageAnalyticsStatus } from './page.analytics'
import { NonNullableFields } from '@brick/types'

export interface IMovePage {
  pageId: Page['id']
  parentId: Page['id']
  position: number | null
  transactionManager?: EntityManager
}

type StylesProviderAncestor = {
  id: Page['id']
  stylesScss: Page['stylesScss']
  stylesCss: string | null
}

const appHost = process.env.PUBLICVAR_BRICK_HOST

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page) private readonly pageModel: TreeRepository<Page>,
    private readonly pageRepository: PageRepository,
    @Inject(forwardRef(() => PublicAddressService))
    private readonly publicAddressService: PublicAddressService,
    private readonly collaborationService: CollaborationService,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => FrontendSocketGateway))
    private readonly frontendSocketGateway: FrontendSocketGateway,
    private dbConnection: Connection,
    private logger: MyLoggerService,
  ) {
    this.logger.setContext('PageService')
    // This is required for 'mpath' property to be returned by typeorm select/find methods
    this.pageModel.metadata.columns.find(x => x.databaseName === 'mpath')!.isVirtual = false
  }


  async setTheme({ pageId, themeId }: { pageId: string; themeId: string }) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['id', 'themeId', 'workspaceId'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    await this.pageModel.update({ id: pageId }, { themeId })
    this.frontendSocketGateway
      .handleThemeUpdate({ pageId, workspaceId: page.workspaceId, themeId })
      .catch(console.error)
  }

  async getUserAllPagesInfo(userId: User['id']): Promise<Page[]> {
    const selectColumns = this.getPageSelectColumnsExcluding(['content', 'stylesScss']).map(
      x => `page.${x}`,
    )
    const pages = await this.pageModel
      .createQueryBuilder('page')
      .select(selectColumns)
      .innerJoinAndSelect('page.workspace', 'workspace')
      .leftJoin('page.acceptedCollaborationInvites', 'acceptedCollaborationInvites')
      .where('workspace.userId = :userId', { userId })
      .getMany()

    return pages
  }

  async getAllPagesInfoInWorkspaces(workspacesIds: Workspace['id'][]) {
    const select = this.getPageSelectColumnsExcluding(['content', 'stylesScss'])
    return this.pageModel.find({
      where: {
        workspaceId: In(workspacesIds),
      },
      select,
    })
  }

  async getPagesSharedToUser(userId: User['id']) {
    const collaborations = await this.collaborationService.findPageAcceptedInvitesByUserId(userId)
    if (!collaborations.length) {
      return []
    }
    // 'filter' doesn't want to agree that afterwards there can't be 'undefined' values
    const collabPagesIds = collaborations
      .map(x => x.pageId satisfies string | undefined)
      .filter(x => x !== undefined) as string[]
    const collabPagesLikeCondition = collabPagesIds.map(x => `%${x}%`)
    const collaborationPages = await this.findPagesExcludingColumns(
      ['content', 'stylesScss', 'collaborationInviteIds'],
      {
        where: {
          mpath: SimilarTo(collabPagesLikeCondition),
        },
      },
    )
    return collaborationPages
  }

  async createWorkspaceRootPage(workspace: Workspace, name: string) {
    const res = await this.pageModel
      .createQueryBuilder()
      .insert()
      .values({
        name: `${name}_rootPage_${workspace.id}`,
        shortId: generateShortPageId(),
        workspace,
        mpath: '',
      })
      .execute()

    const id = res.identifiers[0].id
    return this.pageModel.findOne(id) as Promise<Page>
  }

  async addChildGuidePage(parent: Page) {
    const guidePageId = '54cf5c61-ed9d-44ca-9919-108754914f6b'
    const guidePage = await this.getPageById(guidePageId)
    if (!guidePage) {
      return
    }
    await this.pageModel.save(
      this.pageModel.create({
        parent,
        shortId: generateShortPageId(),
        stylesScss: guidePage.stylesScss,
        name: guidePage.name,
        content: guidePage.content,
        workspaceId: parent.workspaceId,
      }),
    )
  }

  async getPageByCollaborationInviteId(inviteId: string) {
    const page = await this.pageModel.findOne({
      where: {
        collaborationInviteIds: Raw(alias => `:inviteId = ANY(${alias})`, {
          inviteId,
        }),
      },
      relations: ['workspace'],
    })
    return page
  }

  async getUserPagesIds(user: User): Promise<Page['id'][]> {
    const userWorkspaces = await this.workspaceService.getCollabAndOwnByUserId(user.id)
    if (!userWorkspaces || !userWorkspaces.length) {
      return []
    }

    const pages = await this.pageModel.find({
      where: {
        workspaceId: In(userWorkspaces.map(x => x.id)),
      },
      select: ['id'],
    })

    return pages.map(x => x.id)
  }

  async create({
    name,
    parentId,
    workspace,
  }: Required<NonNullableFields<Pick<Page, 'name' | 'parentId' | 'workspace'>>>) {
    const parent = await this.pageModel.findOne(parentId)
    if (!parent) {
      throw new BadRequestException('Parent not found')
    }
    if (parent.workspaceId !== workspace.id) {
      throw new BadRequestException('Parent is outside of workspace')
    }
    // The short ID can collide, but it's extremely unlikely. We'll just fail in this case and let the user try again.
    const shortId = generateShortPageId()
    const { id } = await this.pageModel.save(
      this.pageModel.create({ name, shortId, parent, workspace }),
    )
    const newPage = (await this.pageModel.findOne(id)) as Page
    this.frontendSocketGateway.handleCreatePage({ page: newPage, workspace }).catch(console.error)
    return newPage
  }


  async movePage(
    { pageId, parentId, position, transactionManager }: IMovePage,
    sendSocketEvent: boolean = true,
  ) {

    const move = async (transactionManager: EntityManager) => {
      const pageModel = transactionManager.getRepository(Page)
      const publicAddressModel = transactionManager.getRepository(PublicAddress)
      const page = await pageModel.findOne(pageId)
      if (!page) {
        throw new BadRequestException()
      }
      const prevParentId = page.parentId

      if (!prevParentId) {
        throw new BadRequestException('Cannot move root page')
      }

      const isSameParent = !parentId || parentId === prevParentId
      if (isSameParent && position == null) {
        return
      }

      const prevParent = await pageModel.findOne(prevParentId)

      if (!prevParent) {
        throw new BadRequestException('Prev parent not found')
      }

      if (isSameParent) {
        const prevPosition = prevParent.childrenOrder.indexOf(pageId)

        if (position == null) {
          position = prevPosition
        }

        moveArrayItem(prevParent.childrenOrder, prevPosition, position)
        await pageModel.save(prevParent)
      } else {
        const newParent = await pageModel.findOne(parentId)
        if (!newParent) {
          throw new BadRequestException()
        }
        const isNewParentNonRoot = !!newParent.parentId
        const pagePubliAddress = await publicAddressModel.findOne({
          where: { rootPageId: page.id },
        })
        if (pagePubliAddress && isNewParentNonRoot) {
          throw new BadRequestException(
            `To move this page inside other pages, unbind the domain first`,
          )
        }
        prevParent.childrenOrder = prevParent.childrenOrder.filter(x => x !== pageId)
        await pageModel.save(prevParent)

        newParent.childrenOrder.push(pageId)
        if (position != null) {
          const lastIndex = newParent.childrenOrder.length - 1
          moveArrayItem(newParent.childrenOrder, lastIndex, position)
        }
        await pageModel.save(newParent)

        page.mpath = `${newParent.mpath}${pageId}.`
        page.parent = newParent
        await pageModel.save(page)

        const pageChildren = await pageModel.find({
          where: {
            mpath: Like(`%${pageId}%`),
            id: Not(Equal(pageId)),
          },
        })
        pageChildren.forEach(child => {
          const pageRegex = new RegExp(`.*${pageId}\\.`)
          child.mpath = child.mpath.replace(pageRegex, page.mpath)
        })
        await pageModel.save(pageChildren)
      }
    }
    if (transactionManager) {
      await move(transactionManager)
    } else {
      await this.dbConnection.transaction(manager => move(manager))
    }
    const page = (await this.pageModel.findOne(pageId)) as Page
    if (sendSocketEvent) {
      this.frontendSocketGateway
        .handleWorkspacesPagesStructureChanged({
          workspaceIds: [page.workspaceId],
        })
        .catch(console.error)
    }
    return page
  }

  getPageSelectColumnsExcluding(excludeColumns: (keyof Page)[]) {
    return this.pageModel.metadata.ownColumns
      .filter(x => x.isSelect)
      .map(x => x.propertyName as keyof Page)
      .filter(x => !excludeColumns.includes(x))
  }

  async findPagesExcludingColumns(excludeColumns: (keyof Page)[], options: FindManyOptions<Page>) {
    const select = this.getPageSelectColumnsExcluding(excludeColumns)
    return this.pageModel.find({
      ...options,
      select,
    })
  }

  async findOnePageExcludingColumns(
    pageId: Page['id'],
    excludeColumns: (keyof Page)[],
    options?: FindManyOptions<Page>,
  ) {
    const select = this.getPageSelectColumnsExcluding(excludeColumns)
    return this.pageModel.findOne(pageId, {
      ...options,
      select,
    })
  }

  async getWorkspacePagesInfo(workspace: Workspace) {
    const excludeColumns: (keyof Page)[] = ['content', 'stylesScss']

    const pages = await this.findPagesExcludingColumns(excludeColumns, {
      where: {
        workspace,
      },
      relations: ['acceptedCollaborationInvites'],
    })

    return pages
  }

  async getPageDirectChildren(id: string) {
    const parent = await this.pageModel.findOne(id)
    if (!parent) {
      throw new BadRequestException()
    }

    return this.pageModel.find({ parent })
  }

  async deleteAllPagesInWorkspace(workspaceId: Workspace['id'], entityManager: EntityManager) {
    const pageModel = entityManager.getRepository(Page)
    const publicAddress = entityManager.getRepository(PublicAddress)
    const pageUserCollaborationModel = entityManager.getRepository(PageUserCollaboration)
    const pages = await pageModel.find({
      where: { workspaceId },
      select: ['id'],
    })
    if (!pages.length) {
      throw new BadRequestException()
    }
    this.logger.info('Deleting all pages in workspace', { workspaceId, pages })
    const pagesIds = pages.map(x => x.id)
    const publicAddresses = await publicAddress.find({
      where: {
        rootPageId: In(pagesIds),
      },
    })
    const collaborations = await pageUserCollaborationModel.find({
      where: {
        pageId: In(pagesIds),
      },
    })
    await pageUserCollaborationModel.remove(collaborations)
    await publicAddress.remove(publicAddresses)
    await pageModel.remove(pages)
  }

  async deletePage(id: string) {
    const page = await this.pageModel.findOne(id, {
      select: ['id', 'workspaceId'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    await this.pageRepository.deletePage(id)
    this.frontendSocketGateway
      .handleDeletePage({ pageId: id, workspaceId: page.workspaceId })
      .catch(console.error)
  }

  async getPageById(id: Page['id'], params?: FindOneOptions<Page>) {
    if (!id) {
      return
    }
    return this.pageModel.findOne(id, params)
  }

  async checkPageExists(id: string): Promise<boolean> {
    const count = await this.pageModel.count({ where: { id } })
    return count === 1
  }

  findOne: Repository<Page>['findOne'] = (...args) => {
    // @ts-ignore
    return this.pageModel.findOne(...args)
  }

  /**
   * Finds page root ancestor and return all its children
   */
  async getPageAndRelatives(id: string, params?: { excludeColumns?: (keyof Page)[] }) {
    const page = await this.pageModel.findOne(id)
    if (!page) {
      throw new BadRequestException()
    }
    const rootAncestorId = page.mpath.split('.').filter(Boolean)[0]
    const where = {
      mpath: Raw(x => `${x} LIKE :rootAncestorId`, {
        rootAncestorId: `${rootAncestorId}%`,
      }),
    }

    if (params?.excludeColumns) {
      return this.findPagesExcludingColumns(params.excludeColumns, { where })
    } else {
      return this.pageModel.find({ where })
    }
  }

  async getPageContent(id: string) {
    const page = await this.pageModel.findOne(id, { select: ['content'] })
    if (!page) {
      throw new BadRequestException()
    }
    return page.content
  }

  async getPageAnalyticsStatus(pageId: Page['id']): Promise<PageAnalyticsStatus> {
    const ownerId = await this.getPageOwnerId(pageId)
    const user = await this.userService.getById(ownerId)

    if (!user) {
      throw new BadRequestException('Page owner not found')
    }

    if (
      !SubscriptionPlans[user.subscriptionPlan] ||
      SubscriptionPlans[user.subscriptionPlan]!.mandatoryAnalytics
    ) {
      return PageAnalyticsStatus.clientSide
    } else {
      return PageAnalyticsStatus.serverSide
    }
  }

  async getPageIdByShortId(shortId: Page['shortId']) {
    const page = await this.pageModel.findOne({ shortId }, { select: ['id'] })
    if (!page) {
      throw new NotFoundException()
    }
    return page.id
  }

  async getPageShortIdById(id: Page['id']) {
    const page = await this.pageModel.findOne({ id }, { select: ['id', 'shortId'] })
    if (!page) {
      throw new NotFoundException()
    }
    return page.shortId
  }

  async updatePageContent(id: Page['id'], content: string) {
    const page = await this.pageModel.findOne(id)
    if (!page) {
      throw new NotFoundException()
    }
    const oldContent = page.content
    const oldUpdatedAt = page.updatedAt
    page.content = content
    await this.pageModel.save(page)
    // Interesting changes are ones where the content is erased or heavily rewritten; OR when the last change was more
    // than three hours ago (in case somebody opens a page and it reverts to the old version or something)
    const hoursSinceLastChange = (Date.now() - Date.parse(oldUpdatedAt)) / (1000 * 60 * 60)
    const isInterestingChange =
      content === '' ||
      (content.length < 20 && oldContent && oldContent.length >= 40) ||
      hoursSinceLastChange >= 3
    if (oldContent && oldContent.length > 0 && isInterestingChange) {
      const historyEntry = { timestamp: now(), content: oldContent }
      await this.pageModel
        .createQueryBuilder()
        .update()
        .set({
          history: () => `history || :entry::jsonb`,
        })
        .setParameter('entry', historyEntry)
        .where({ id })
        .execute()
    }
  }

  async setPageTitle(id: string, title: string): Promise<void> {
    const page = await this.pageModel.findOne(id, {
      select: ['id', 'workspaceId'],
    })
    if (!page) {
      throw new BadRequestException()
    }

    await this.pageModel.update({ id }, { name: title })
    this.frontendSocketGateway
      .handlePageTitleUpdated({
        pageId: id,
        workspaceId: page.workspaceId,
        title,
      })
      .catch(console.error)
  }

  async setPageStyles(id: Page['id'], stylesScss: Page['stylesScss'] | null) {
    const page = await this.pageModel.findOne(id, {
      select: ['id', 'stylesScss', 'workspaceId'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    page.stylesScss = stylesScss
    await this.pageModel.save(page)
    const css = renderScss(stylesScss)
    this.frontendSocketGateway
      .handleStylesUpdate({
        pageId: id,
        workspaceId: page.workspaceId,
        css: css || '',
        scss: stylesScss,
      })
      .catch(console.error)
  }

  async setPageCustomLink(id: Page['id'], customLink: Page['customLink']) {
    const page = await this.pageModel.findOne(id)
    if (!page) {
      throw new BadRequestException('Page not found')
    }

    const pageMpathSplitted = page.mpath.split('.').filter(Boolean)
    const pageRootAncestorId = pageMpathSplitted[0]
    if (id === pageRootAncestorId) {
      throw new BadRequestException(`Root pages can't have custom links`)
    }

    const notAllowedCharacters = /[^\p{L}\d.~_-]/gu
    const sanitize = (str: string) => str.replace(notAllowedCharacters, '').toLowerCase()
    const encodedLink =
      typeof customLink === 'string' ? encodeURIComponent(sanitize(customLink)) : null
    page.customLink = encodedLink || null
    await this.pageModel.save(page)
  }

  async getPageOwnerId(id: Page['id']) {
    const page = await this.pageModel.findOne(id, {
      relations: ['workspace'],
      select: ['workspace', 'id'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }

    return page.workspace.userId
  }

  async getPageOwner(id: Page['id']) {
    const page = await this.pageModel.findOne(id, {
      relations: ['workspace'],
      select: ['workspace', 'id'],
    })

    if (!page) {
      throw new BadRequestException('Page not found')
    }

    return this.userService.getById(page.workspace.userId)
  }

  async checkIfOwnerByUserId(pageId: Page['id'], userId: User['id']) {
    const page = await this.pageModel.findOne(pageId, {
      relations: ['workspace'],
      select: ['workspace', 'id'],
    })
    if (!page) {
      throw new NotFoundException()
    }
    return page.workspace.userId === userId
  }
  async getPageStyles(id: Page['id']) {
    const page = await this.pageModel.findOne({
      where: { id },
      select: ['id', 'stylesScss'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    return page.stylesScss
  }

  async getStylesProviderAncestor(id: Page['id']): Promise<StylesProviderAncestor | null> {
    const page = await this.pageModel.findOne(id, {
      select: ['mpath'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    const ancestors = page.mpath.split('.').filter(Boolean).slice(0, -1).reverse()
    if (!ancestors.length) {
      return null
    }

    const firstFoundAncestorWithStyles: Required<Pick<Page, 'id' | 'stylesScss'>> | undefined =
      await this.pageModel
        .createQueryBuilder()
        .select(['"id"', '"stylesScss"'])
        .where({
          id: In(ancestors),
          stylesScss: Not(IsNull()),
        })
        .orderBy(`array_position(:ancestors, "id"::text)`)
        .setParameters({ ancestors })
        .limit(1)
        .getRawOne()

    if (!firstFoundAncestorWithStyles) {
      return null
    }

    const stylesCss = renderScss(firstFoundAncestorWithStyles.stylesScss)

    return { ...firstFoundAncestorWithStyles, stylesCss }
  }

  getPageIdWithSlug = (page: Page) => {
    const pageSlug = slugify(page.name)
    return pageSlug + (pageSlug ? '-' : '') + page.shortId
  }

  async getPageCanonicalLink(page: Page): Promise<string> {

    const pageRootAncestorId = page.mpath.split('.').filter(Boolean)[0]
    const publicAddress = await this.publicAddressService.findOne({
      rootPageId: pageRootAncestorId,
    })
    const isPageRootPage = page.id === pageRootAncestorId

    if (!publicAddress) {
      return `https://page.${appHost}/${this.getPageIdWithSlug(page)}`
    }

    const { externalDomain, subdomain } = publicAddress
    const host = externalDomain || `${subdomain!}.${appHost}`

    return `https://${host}${isPageRootPage ? '' : `/${await this.getPagePath(page)}`}`
  }

  async pageContentToText(content?: string | null): Promise<string> {
    if (!content) {
      return ''
    }

    const length = 160
    const fullText = htmlToText(content, {
      ignoreHref: true,
      ignoreImage: true,
      wordwrap: false,
      noLinkBrackets: true,
      uppercaseHeadings: false,
      singleNewLineParagraphs: true,
    })
    const cutText = fullText.substring(0, length - 1)
    return escape(`${cutText}${fullText.length > cutText.length ? '...' : ''}`)
  }

  async getPagePath(page: Page, addSlugs: boolean = true): Promise<string> {
    const pathItems = [page.customLink || (addSlugs ? this.getPageIdWithSlug(page) : page.shortId)]
    const getPath = () => pathItems.join('/')
    const splittedMpath = page.mpath.split('.').filter(Boolean)
    const isRootPage = splittedMpath.length === 1
    if (isRootPage) {
      return ''
    }

    const nonRootAncestorsIds = splittedMpath.slice(1, -1)
    if (nonRootAncestorsIds.length) {
      const sortAsInMpath = (a: Page, b: Page) =>
        nonRootAncestorsIds.indexOf(a.id) - nonRootAncestorsIds.indexOf(b.id)
      const nonRootAncestors = (
        await this.pageModel.find({
          where: { id: In(nonRootAncestorsIds) },
          select: ['id', 'shortId', 'customLink', 'name'],
        })
      ).sort(sortAsInMpath)

      if (!page.customLink && !nonRootAncestors.some(x => x.customLink)) {
        return getPath()
      }

      pathItems.unshift(
        ...nonRootAncestors.map(
          p => p.customLink || (addSlugs ? this.getPageIdWithSlug(p) : p.shortId),
        ),
      )
    }

    return getPath()
  }

  async createCollaborationInvite(id: Page['id']) {
    const page = await this.pageModel.findOne(id, {
      select: ['collaborationInviteIds'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    const inviteId = this.generateCollaborationInvite()
    await this.pageModel.update(
      { id },
      {
        collaborationInviteIds: [...page.collaborationInviteIds, inviteId],
      },
    )
    return inviteId
  }

  async deleteCollaborationInvite({ pageId, inviteId }: { pageId: Page['id']; inviteId: string }) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['collaborationInviteIds'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    await this.pageModel.update(
      { id: pageId },
      {
        collaborationInviteIds: page.collaborationInviteIds.filter(x => x !== inviteId),
      },
    )
  }

  async movePageToWorkspace({
    pageId,
    workspaceId,
  }: {
    pageId: Page['id']
    workspaceId: Workspace['id']
  }) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['mpath', 'id', 'parentId'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    const prevWorkspaceId = page.workspaceId
    if (prevWorkspaceId === workspaceId) {
      throw new BadRequestException(`Page already belongs to this workspace`)
    }
    const oldParentId = page.parentId

    if (!oldParentId) {
      throw new BadRequestException(`Can't move root page to workspace`)
    }

    const isPagePrivate = await this.checkIsPrivatePage(page.id)
    await this.dbConnection.transaction(async manager => {
      const pageModel = manager.getRepository(Page)
      const workspaceModel = manager.getRepository(Workspace)
      const newWorkspace = await workspaceModel.findOne(workspaceId)
      if (!newWorkspace) {
        throw new BadRequestException(`New workspace not found`)
      }
      const newParentId = isPagePrivate
        ? newWorkspace.privateRootPageId
        : newWorkspace.publicRootPageId
      if (!newParentId) {
        throw new BadRequestException(`New workspace root page not found`)
      }
      await this.movePage(
        {
          pageId,
          parentId: newParentId,
          position: null,
          transactionManager: manager,
        },
        false,
      )
      const pageAndChildren = await pageModel.find({
        where: { mpath: Like(`%${pageId}%`) },
        select: ['id', 'workspaceId'],
      })
      pageAndChildren.forEach(x => (x.workspaceId = workspaceId))
      await pageModel.save(pageAndChildren)
    })
    const updatedPage = (await this.findOnePageExcludingColumns(pageId, [
      'stylesScss',
      'content',
    ])) as Page

    const newParent = await this.findOnePageExcludingColumns(updatedPage.parentId!, [
      'stylesScss',
      'content',
    ])
    const oldParent = await this.findOnePageExcludingColumns(oldParentId, ['stylesScss', 'content'])
    // Resends users of previous workspace array of pages. Not handleDeletedPage because users could have access to new workspace too.
    this.frontendSocketGateway
      .handleWorkspacesPagesStructureChanged({
        workspaceIds: [workspaceId, prevWorkspaceId],
      })
      .catch(e => console.error(e))
    return {
      updatedPage,
      newParent,
      oldParent,
    }
  }

  generateCollaborationInvite() {
    return uuidv4()
  }

  async authorizePageAction(pageId: Page['id'], userId: User['id'], action: PageAction) {
    if (!pageId || !isUUID(pageId)) {
      throw new BadRequestException('Page id is not valid')
    }
    const isAuthorized = await this.isUserAuthorizedForPageAction(pageId, userId, action)
    if (!isAuthorized) {
      throw new ForbiddenException()
    }

    return this.getUserPageRole({ pageId, userId })
  }

  async isUserAuthorizedForPageAction(pageId: Page['id'], userId: User['id'], action: PageAction) {
    const role = await this.getUserPageRole({ pageId, userId })
    return canRolePerformPageAction(role, action)
  }

  async getUserPageRole({
    userId,
    pageId,
  }: {
    userId: User['id']
    pageId: Page['id']
  }): Promise<UserPageRole> {
    const page = await this.findOne(pageId, { select: ['id', 'workspaceId'] })
    if (!page) {
      throw new BadRequestException(`Can't authorize page access because it does not exist`)
    }
    // Order is important here. Should check roles with more privileges BEFORE roles with less to return most advanced role.
    const isOwner = await this.checkIfOwnerByUserId(pageId, userId)
    if (isOwner) {
      return UserPageRole.owner
    }

    const workspace = await this.workspaceService.getById(page.workspaceId)
    if (!workspace) {
      throw new InternalServerErrorException('Page exists but workspace for it does not!')
    }
    const isWorkspaceCollaborator = await this.collaborationService.isUserWorkspaceCollaborator({
      userId,
      workspaceId: workspace.id,
    })

    if (isWorkspaceCollaborator) {
      return UserPageRole.workspaceCollaborator
    }

    const isPageCollaborator = await this.collaborationService.isUserPageCollaborator({
      pageId,
      userId,
    })
    if (isPageCollaborator) {
      return UserPageRole.pageCollaborator
    }

    return UserPageRole.guest
  }

  /**
   * @param publicAddress
   * @param path = Possible cases: '/page1/page2' - nested custom links, '/23guhf823n' - short id, '/sa-dwa-da-23guhf823n' - slug with short id
   * and the same cases with long id
   * @returns
   */
  async findPublicAddressPageByPath(publicAddress: PublicAddress, path: string) {
    const pathItems = path.split('/').filter(Boolean)
    const pathLastItem = pathItems.length ? pathItems.slice(-1)[0] : ''

    const isPathToUuid = isUUID(pathLastItem)
    const shortPageIdFromPath = extractShortPageId(pathLastItem)
    const isPathToCustomLink = path && !isPathToUuid && !shortPageIdFromPath

    if (isPathToCustomLink) {
      const pages = await this.pageModel.find({
        where: {
          customLink: pathLastItem,
          mpath: Like(`%${publicAddress.rootPageId}%`),
        },
      })

      if (!pages.length) {
        return null
      }

      if (pages.length === 1) {
        const page = await this.findOne({
          where: { id: pages[0].id },
          relations: ['workspace'],
        })
        return page
      }

      const pagesWithFullPaths = await Promise.all(
        pages.map(async x => ({
          ...x,
          fullPath: `/${await this.getPagePath(x, false)}`,
        })),
      )

      const pathWithoutSlugs =
        '/' +
        (
          await Promise.all(
            pathItems.map(async x => {
              if (isUUID(x)) {
                return this.getPageShortIdById(x)
              }
              return extractShortPageId(x) ? extractShortPageId(x) : x
            }),
          )
        ).join('/')

      const rightPage = pagesWithFullPaths.find(x => x.fullPath === pathWithoutSlugs)
      if (!rightPage) {
        return null
      }

      return this.findOne({
        where: { id: rightPage.id },
        relations: ['workspace'],
      })
    } else {
      const searchCondition = !path
        ? { id: publicAddress.rootPageId }
        : isPathToUuid
          ? { id: pathLastItem }
          : { shortId: shortPageIdFromPath }

      const page = await this.findOne({
        where: searchCondition,
        relations: ['workspace'],
      })

      return page
    }
  }

  async getPageHeadTags(pageId: Page['id']): Promise<undefined | PageCustomHeadTag[]> {
    const page = await this.pageRepository.findOne(pageId, {
      select: ['id', 'renderCustomizations'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    return page?.renderCustomizations?.headTags
  }

  async setPageHeadTags(pageId: Page['id'], headTags: PageCustomHeadTag[]) {
    const page = await this.pageRepository.findOne(pageId, {
      select: ['id', 'renderCustomizations'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }

    page.renderCustomizations = Object.assign({}, page.renderCustomizations || {}, {
      headTags,
    })
    await this.pageRepository.save(page)
  }

  async getWorkspacePrivatePagesIds(workspaceId: Workspace['id']) {
    const workspace = await this.workspaceService.getById(workspaceId)
    if (!workspace) {
      return []
    }
    const { privateRootPageId } = workspace
    const topPrivatePagesIdsSearchPattern = (
      await this.pageModel.find({
        where: { parentId: privateRootPageId },
        select: ['id'],
      })
    ).map(x => `%${x.id}%`)
    if (!topPrivatePagesIdsSearchPattern.length) {
      return [privateRootPageId]
    }
    const privatePages = await this.pageModel.find({
      where: { mpath: SimilarTo(topPrivatePagesIdsSearchPattern) },
      select: ['id'],
    })

    return [privateRootPageId, ...privatePages.map(x => x.id)]
  }

  async checkIsPrivatePage(pageId: Page['id']) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['workspaceId'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    const workspacePrivatePagesIds = await this.getWorkspacePrivatePagesIds(page.workspaceId)
    return workspacePrivatePagesIds.includes(pageId)
  }

  async checkIsRootPage(pageId: Page['id']) {
    const page = await this.pageModel.findOne(pageId, { select: ['parentId'] })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    return page.parentId == null
  }

  async getPageWorkspaceId(pageId: Page['id']) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['workspaceId'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    return page.workspaceId
  }

  async getPageParentId(pageId: Page['id']) {
    const page = await this.pageModel.findOne(pageId, {
      select: ['parentId'],
    })
    if (!page) {
      throw new BadRequestException('Page not found')
    }
    return page.parentId
  }
}