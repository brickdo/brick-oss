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

import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils'
import Widget from '@ckeditor/ckeditor5-widget/src/widget'
import Command from '@ckeditor/ckeditor5-core/src/command'
import View from '@ckeditor/ckeditor5-ui/src/view'
import ReactDOM from 'react-dom'
import { Provider } from 'overmind-react'
import { store } from '../store'
import PageLinkPluginBtn from '../components/PageLinkPluginBtn'
import { IoIosDocument } from '@react-icons/all-files/io/IoIosDocument'

const pluginClasses = ['app-ck-plugin', 'ck-reset_all-excluded']
const insertCommandName = 'insertPageLink'

const pageLinkEditingRenderer = ({ name, mountEl }) => {
  ReactDOM.render(
    <Provider value={store}>
      <IoIosDocument
        className='inline-block mr-1'
        color='#989898'
        style={{
          verticalAlign: 'text-top',
        }}
      />
      <span>{name}</span>
    </Provider>,
    mountEl,
  )
}

class ReactCustomBtn extends View {
  constructor({ onPageSelect }) {
    super()
    this.onPageSelect = onPageSelect
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: pluginClasses,
      },
    })
  }

  render() {
    super.render()
    const { element } = this

    ReactDOM.render(
      <Provider value={store}>
        <PageLinkPluginBtn
          mountEl={element}
          pluginClasses={pluginClasses}
          onPageSelect={this.onPageSelect}
        />
      </Provider>,
      element,
    )
  }

  destroy() {
    ReactDOM.unmountComponentAtNode(this.element)
    super.destroy()
  }
}

class PageLinkUI extends Plugin {
  init() {
    const { editor } = this
    editor.ui.componentFactory.add('pageLink', locale => {
      const onPageSelect = ({ id, shortId, name }) =>
        editor.execute(insertCommandName, { id: shortId, name })
      return new ReactCustomBtn({ onPageSelect })
    })
  }
}

class InsertPageLinkCommand extends Command {
  execute({ id, name }) {
    this.editor.model.change(writer => {
      this.editor.model.insertContent(writer.createElement('pageLink', { id, name }))
    })
  }

  refresh() {
    const model = this.editor.model
    const selection = model.document.selection
    const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'pageLink')


    this.isEnabled = allowedIn !== null
  }
}

class PageLinkEditing extends Plugin {
  static get requires() {
    return [Widget]
  }

  init() {
    this._defineSchema()
    this._defineConverters()

    this.editor.commands.add(insertCommandName, new InsertPageLinkCommand(this.editor))
  }

  _defineSchema() {
    const schema = this.editor.model.schema

    schema.register('pageLink', {
      allowWhere: '$text',
      // The page link will act as an inline node:
      isInline: true,
      // Behaves like a self-contained object (e.g. an image).
      isObject: true,
      // Each page link has an ID (page's shortId) and the content of the link (the page
      // title at the moment of link creation)
      allowAttributes: ['id', 'name'],
    })
  }

  _defineConverters() {
    const editor = this.editor
    const conversion = editor.conversion
    // const renderLink = editor.config.get('pageLinks').linkRenderer
    const renderLink = pageLinkEditingRenderer

    // "Data view -> model". Read the "href" attribute from the view
    // and set it as the "id" in the model.
    conversion.for('upcast').elementToElement({
      view: {
        name: 'a',
        classes: 'page-link',
      },
      model: (viewElement, modelWriter) => {
        return modelWriter.writer.createElement('pageLink', {
          id: viewElement.getAttribute('href').split('/').pop(),
          name: viewElement.getChild(0).data,
        })
      },
    })

    // "Editing view -> model". Read the "data-id" and "data-name" attrs.
    // Needed due to https://github.com/ckeditor/ckeditor5/issues/8874.
    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: 'page-link',
      },
      model: (viewElement, modelWriter) => {
        return modelWriter.writer.createElement('pageLink', {
          id: viewElement.getAttribute('data-id'),
          name: viewElement.getAttribute('data-name'),
        })
      },
    })

    // "Model -> data view"
    conversion.for('dataDowncast').elementToElement({
      model: 'pageLink',
      view: (modelElement, { writer: viewWriter }) => {
        const id = modelElement.getAttribute('id')
        const name = modelElement.getAttribute('name')
        const anchorElement = viewWriter.createContainerElement('a', {
          class: 'page-link',
          href: `https://brick.do/${id}`,
        })
        const innerText = viewWriter.createText(name)
        viewWriter.insert(viewWriter.createPositionAt(anchorElement, 0), innerText)

        return anchorElement
      },
    })

    // "Model -> editing view"
    conversion.for('editingDowncast').elementToElement({
      model: 'pageLink',
      view: (modelElement, { writer: viewWriter }) => {
        const id = modelElement.getAttribute('id')
        const name = modelElement.getAttribute('name')

        const span = viewWriter.createContainerElement('span', {
          class: 'page-link',
          'data-id': id,
          'data-name': name,
        })

        const reactWrapper = viewWriter.createRawElement(
          'span',
          {
            class: 'page-link__react-wrapper',
          },
          function (domElement) {
            renderLink({ id, name, mountEl: domElement })
          },
        )

        viewWriter.insert(viewWriter.createPositionAt(span, 0), reactWrapper)

        return toWidget(span, viewWriter)
      },
    })
  }
}

export default class PageLink extends Plugin {
  static get requires() {
    return [PageLinkEditing, PageLinkUI]
  }
}