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

import { ReactElement, useState, useRef, useEffect, ChangeEvent } from 'react'
import CustomInput from './CustomInput'
import css from 'styled-jsx/css'
import { NavLink } from 'react-router-dom'
import { KEY_RETURN } from 'keycode-js'
import isURL from 'validator/lib/isURL'
import normalizeUrl from 'normalize-url'
import OutOfDomainsDialog from './OutOfDomainsDialog'
import { ComponentRef } from '../types'
import { PageView, PublicAddress } from '@brick-shared/types'
import confirm from '../helpers/confirm'
import { FormControlLabel, Radio } from '@material-ui/core'
import { useActions, useAppState } from '../store'
import { is402, is409 } from '@brick-shared/api/errorChecks'

interface Props {
  pageId: PageView['id']
  publicAddress?: PublicAddress
  hide?: Function
}
enum DomainType {
  subdomain = 'subdomain',
  custom = 'custom',
}

type SslGenResult = {
  message?: string
  isError: boolean
} | null


function PublicAddressDomainUpdate({ pageId, publicAddress, hide }: Props): ReactElement {
  const { updateOrCreatePublicAddress, deletePublicAddress, generatePublicAddressSsl } =
    useActions()
  const { userSubscriptionPlan: userSubscription, pages, workspaces, user } = useAppState()
  const currentDomain = publicAddress?.externalDomain || publicAddress?.subdomain || ''
  const isCurrentDomainCustom = publicAddress?.externalDomain
  const pageWorkspaceId = pages[pageId]?.workspaceId
  const pageWorkspace = workspaces.find(x => x.id === pageWorkspaceId)
  const isUserWorkspaceOwner = pageWorkspace && user && pageWorkspace.userId === user.id
  const canUserHaveCustomDomains = isUserWorkspaceOwner
    ? !!userSubscription?.entities.domains.limit
    : pageWorkspace?.ownerSubscriptionLimits?.numberOfDomains

  const initialDomainType = isCurrentDomainCustom ? DomainType.custom : DomainType.subdomain
  const [selectedDomainType, setSelectedDomainType] = useState(initialDomainType)
  const [subdomainEdit, setSubdomainEdit] = useState(isCurrentDomainCustom ? '' : currentDomain)
  const [customDomainEdit, setCustomDomainEdit] = useState(
    !isCurrentDomainCustom ? '' : currentDomain,
  )
  const subdomainInputRef = useRef<HTMLInputElement>(null)
  const customDomainInputRef = useRef<HTMLInputElement>(null)
  const upgradeRequiredDialogRef = useRef<ComponentRef<typeof OutOfDomainsDialog>>(null)
  const resetSubmitError = () => setSubmitError(null)
  const isCustomDomainType = selectedDomainType === DomainType.custom
  const onRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    resetSubmitError()
    // @ts-ignore
    setSelectedDomainType(e.target.value as DomainType)
  }
  const focusDomainInput = () => {
    const inputRef = isCustomDomainType ? customDomainInputRef : subdomainInputRef
    inputRef.current?.focus()
  }
  useEffect(focusDomainInput, [isCustomDomainType])

  const isDomainEdited =
    currentDomain !== (isCurrentDomainCustom ? customDomainEdit : subdomainEdit) ||
    initialDomainType !== selectedDomainType

  const deleteCurrentAddress = async () => {
    if (!publicAddress) {
      return
    }

    const confirmed = await confirm({
      text: 'Deleting public address will make it free to use by other users. Are you sure?',
    })
    if (!confirmed) {
      return
    }

    await deletePublicAddress(publicAddress.id)
  }

  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<null | string>(null)

  const validateDomainInput = () => {
    const customDomainErrorMessage = 'Please provide valid URL'
    const subdomainErrorMessage = subdomainEdit
      ? `Subdomain can only contain latin letters, numbers, and "_", "-" symbols`
      : 'Subdomain cannot be empty'
    const subdomainRegex = /^[a-zA-Z0-9_-]+$/

    const isValid = isCustomDomainType
      ? isURL(customDomainEdit)
      : subdomainRegex.test(subdomainEdit)
    const errorMesage =
      !isValid && (isCustomDomainType ? customDomainErrorMessage : subdomainErrorMessage)

    if (errorMesage) {
      setSubmitError(errorMesage)
      return
    }

    return true
  }

  const submit = async () => {
    try {
      const isValid = validateDomainInput()
      if (!isValid) {
        return
      }

      let normalizedCustomUrl
      if (isCustomDomainType) {
        try {
          normalizedCustomUrl = new URL(normalizeUrl(customDomainEdit)).host
          setCustomDomainEdit(normalizedCustomUrl)
        } catch (e) {
          setSubmitError('Wrong URL format')
          return
        }
      }

      await updateOrCreatePublicAddress({
        rootPageId: pageId,
        ...(isCustomDomainType
          ? { externalDomain: normalizedCustomUrl }
          : { subdomain: subdomainEdit }),
      })
      setIsSuccess(true)
    } catch (e) {
      if (is402(e)) {
        upgradeRequiredDialogRef.current?.show()
        return
      }
      const isConflictError = is409(e)
      const errorMessage = isConflictError
        ? 'Sorry, this domain is already taken. Please choose another one'
        : `Unknown error (${e?.message}), please contact support`
      setSubmitError(errorMessage)
      if (!isConflictError) {
        throw e
      }
    }
  }

  const getSubdomainUrl = (subdomain: string) => {
    const { host, protocol } = window.location
    return `${protocol}//${subdomain}.${host}`
  }

  const subdomainSuccess = (
    <div>
      Success! <br /> <br />
      Use the following link to share{' '}
      <span className='p-1 text-gray-800 font-mono bg-gray-200 break-words'>
        {getSubdomainUrl(subdomainEdit)}
      </span>
    </div>
  )
  const customDomainSuccess = (
    <div>
      Success! <br />
      Now page will be served at{' '}
      <span className='p-1 text-gray-800 font-mono bg-gray-200 break-words'>
        {customDomainEdit}
      </span>{' '}
      <br /> <br />
      Use{' '}
      <a
        href='https://help.brick.do/02aaaaee-0140-44ee-9d99-0e8cd4583a0c'
        target='_blank'
        rel='noopener noreferrer'
      >
        this instruction
      </a>{' '}
      to update your domain provider settings.
    </div>
  )

  const successContent = isCustomDomainType ? customDomainSuccess : subdomainSuccess

  const [isSslGenLoading, setIsSslGenLoading] = useState(false)
  const [sslGenResult, setSslGenResult] = useState<SslGenResult>(null)


  const generateSsl = async () => {
    if (!publicAddress) {
      return
    }

    setSslGenResult(null)
    try {
      setIsSslGenLoading(true)
      await generatePublicAddressSsl(publicAddress.id)
      setSslGenResult({ isError: false })
    } catch (e) {
      setSslGenResult({
        isError: true,
        message: `Unknown error (${e?.message}), please contact support`,
      })
    } finally {
      setIsSslGenLoading(false)
    }
  }

  return (
    <div
      className='px-4 py-2 flex flex-col items-start domain-update'
      onKeyDown={e => e.keyCode === KEY_RETURN && submit()}
    >
      {isSuccess ? (
        successContent
      ) : (
        <>
          <FormControlLabel
            value={DomainType.subdomain}
            control={<Radio />}
            className='radio-button'
            label='Brick subdomain'
            placeholder='subdomain'
            // @ts-ignore
            onChange={onRadioChange}
            checked={!isCustomDomainType}
          />

          {!isCustomDomainType && (
            <CustomInput
              className='w-full subdomain-input'
              ref={subdomainInputRef}
              value={subdomainEdit}
              onChange={val => {
                resetSubmitError()
                setSubdomainEdit(val.toLowerCase())
              }}
              postfix={`.${window.location.host}`}
              error={submitError}
            />
          )}

          <FormControlLabel
            className='radio-button mt-4'
            value={DomainType.custom}
            control={<Radio />}
            label='Custom domain'
            // @ts-ignore
            onChange={onRadioChange}
            disabled={!canUserHaveCustomDomains}
            checked={isCustomDomainType}
          />
          {!canUserHaveCustomDomains && (
            <span className='text-sm text-gray-600'>
              (To use custom domain{' '}
              <NavLink to='/settings/subscription' onClick={() => hide && hide()}>
                upgrade your subscription
              </NavLink>
              )
            </span>
          )}

          {isCustomDomainType && (
            <CustomInput
              className='w-full custom-domain-input'
              placeholder='example.com'
              value={customDomainEdit}
              onChange={val => {
                resetSubmitError()
                setCustomDomainEdit(val)
              }}
              ref={customDomainInputRef}
              error={submitError}
            />
          )}

          {isCustomDomainType &&
            isCurrentDomainCustom &&
            !sslGenResult &&
            (!isSslGenLoading ? (
              <button
                className='block bg-green-500 hover:bg-green-600 font-semibold text-white py-2 px-4 ml-2 mt-1 border border-blue-500 hover:border-transparent rounded'
                onClick={generateSsl}
              >
                Generate SSL certificate
              </button>
            ) : (
              <div className='ml-2'>Loading...</div>
            ))}
          {sslGenResult &&
            (sslGenResult.isError ? (
              <div className='text-red-600 mt-2 ml-2' role='alert'>
                {sslGenResult.message}
              </div>
            ) : (
              <div className='text-green-800 mt-2 ml-2' role='status'>
                Success!{' '}
                <a target='_blank' rel='noopener noreferrer' href={`https://${currentDomain}`}>
                  Check your website
                </a>
              </div>
            ))}

          <p>
            If you change the domain, the old domain's root page will not work anymore. However, all
            links with a page ID in them will still work.
          </p>

          <div className='flex justify-end   w-full mt-4'>
            {publicAddress && (
              <button
                className='block bg-red-500 hover:bg-red-600 font-semibold text-white py-2 px-4 border border-red-500 hover:border-transparent rounded mr-4'
                onClick={deleteCurrentAddress}
              >
                Delete current address
              </button>
            )}

            <button
              className='block bg-blue-500 hover:bg-blue-600 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
              disabled={!isDomainEdited}
              onClick={submit}
            >
              Save
            </button>
          </div>
        </>
      )}

      <OutOfDomainsDialog ref={upgradeRequiredDialogRef} />
      <style jsx>{style}</style>
    </div>
  )
}

const style = css`
  .domain-update {
    width: 370px;
    max-width: 370px;
  }
  * :global(.radio-button span) {
    font-size: 1.2rem;
    letter-spacing: unset;
  }
  * :global(.radio-button.mt-4) {
    margin-top: 1rem !important;
  }
`

export default PublicAddressDomainUpdate