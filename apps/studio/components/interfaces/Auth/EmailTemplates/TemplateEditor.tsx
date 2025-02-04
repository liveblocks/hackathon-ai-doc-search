import { PermissionAction } from '@supabase/shared-types/out/constants'
import { useParams } from 'common'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import {
  AlertTitle_Shadcn_,
  Alert_Shadcn_,
  Form,
  IconCode,
  IconInfo,
  IconMonitor,
  Input,
  Tabs,
} from 'ui'

import { CodeEditor } from 'components/ui/CodeEditor'
import { FormActions, FormSection, FormSectionContent, FormSectionLabel } from 'components/ui/Forms'
import InformationBox from 'components/ui/InformationBox'
import { useAuthConfigUpdateMutation } from 'data/auth/auth-config-update-mutation'
import { useCheckPermissions } from 'hooks'
import { FormSchema } from 'types'

interface TemplateEditorProps {
  template: FormSchema
  authConfig: Record<string, string>
}

const TemplateEditor = ({ template, authConfig }: TemplateEditorProps) => {
  const { ref: projectRef } = useParams()
  const { mutate: updateAuthConfig, isLoading: isUpdatingConfig } = useAuthConfigUpdateMutation()

  const { id, properties } = template

  const formId = `auth-config-email-templates-${id}`
  const INITIAL_VALUES = useMemo(() => {
    const result: { [x: string]: string } = {}
    Object.keys(properties).forEach((key) => {
      result[key] = (authConfig && authConfig[key]) ?? ''
    })
    return result
  }, [authConfig, properties])
  const canUpdateConfig = useCheckPermissions(PermissionAction.UPDATE, 'custom_config_gotrue')

  const messageSlug = `MAILER_TEMPLATES_${id}_CONTENT`
  const messageProperty = properties[messageSlug]
  const [bodyValue, setBodyValue] = useState((authConfig && authConfig[messageSlug]) ?? '')
  const onSubmit = (values: any, { resetForm }: any) => {
    const payload = { ...values }

    // Because the template content uses the code editor which is not a form component
    // its state is kept separately from the form state, hence why we manually inject it here
    delete payload[messageSlug]
    if (messageProperty) payload[messageSlug] = bodyValue

    updateAuthConfig(
      { projectRef: projectRef!, config: payload },
      {
        onError: () => toast.error('Failed to update settings'),
        onSuccess: () => {
          toast.success('Successfully updated settings')
          resetForm({
            values: values,
            initialValues: values,
          })
        },
      }
    )
  }

  return (
    <Form id={formId} className="!border-t-0" initialValues={INITIAL_VALUES} onSubmit={onSubmit}>
      {({ resetForm, values, initialValues }: any) => {
        const message = (authConfig && authConfig[messageSlug]) ?? ''
        const hasChanges =
          JSON.stringify(values) !== JSON.stringify(initialValues) || message !== bodyValue

        return (
          <>
            <FormSection className="!border-t-0 pb-8 pt-4">
              <FormSectionContent loading={false}>
                {Object.keys(properties).map((x: string) => {
                  const property = properties[x]
                  if (property.type === 'string') {
                    return (
                      <div key={x} className="space-y-3">
                        <label className="col-span-12 text-sm text-foreground lg:col-span-5">
                          {property.title}
                        </label>
                        <Input
                          size="small"
                          layout="vertical"
                          id={x}
                          key={x}
                          name={x}
                          descriptionText={
                            property.description ? (
                              <ReactMarkdown unwrapDisallowed disallowedElements={['p']}>
                                {property.description}
                              </ReactMarkdown>
                            ) : null
                          }
                          labelOptional={
                            property.descriptionOptional ? (
                              <ReactMarkdown unwrapDisallowed disallowedElements={['p']}>
                                {property.descriptionOptional}
                              </ReactMarkdown>
                            ) : null
                          }
                          disabled={!canUpdateConfig}
                        />
                      </div>
                    )
                  }
                })}
              </FormSectionContent>
            </FormSection>
            <FormSection className="!mt-0 grid-cols-12 !border-t-0 !pt-0">
              <FormSectionContent fullWidth loading={false}>
                {messageProperty && (
                  <>
                    <div className="space-y-3">
                      <FormSectionLabel>
                        <span>{messageProperty.title}</span>
                      </FormSectionLabel>
                      <InformationBox
                        defaultVisibility
                        title="Message variables"
                        hideCollapse={false}
                        description={
                          messageProperty.description && (
                            <ReactMarkdown>{messageProperty.description}</ReactMarkdown>
                          )
                        }
                      />
                    </div>
                    <Tabs defaultActiveId="source" type="underlined" size="tiny">
                      <Tabs.Panel id={'source'} icon={<IconCode />} label="Source">
                        <div className="relative h-96">
                          <CodeEditor
                            id="code-id"
                            language="html"
                            isReadOnly={!canUpdateConfig}
                            className="!mb-0 h-96 overflow-hidden rounded border"
                            onInputChange={(e: string | undefined) => setBodyValue(e ?? '')}
                            options={{ wordWrap: 'off', contextmenu: false }}
                            value={bodyValue}
                          />
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id={'preview'} icon={<IconMonitor />} label="Preview">
                        <Alert_Shadcn_ className="mb-2" variant="default">
                          <IconInfo strokeWidth={1.5} />
                          <AlertTitle_Shadcn_>
                            The preview may differ slightly from the actual rendering in the email
                            client.
                          </AlertTitle_Shadcn_>
                        </Alert_Shadcn_>
                        <iframe
                          className="!mb-0 overflow-hidden h-96 w-full rounded border"
                          title={id}
                          srcDoc={bodyValue}
                        />
                      </Tabs.Panel>
                    </Tabs>
                  </>
                )}
                <div className="col-span-12 flex w-full">
                  <FormActions
                    handleReset={() => {
                      resetForm({
                        values: authConfig,
                        initialValues: authConfig,
                      })
                      setBodyValue((authConfig && authConfig[messageSlug]) ?? '')
                    }}
                    form={formId}
                    isSubmitting={isUpdatingConfig}
                    hasChanges={hasChanges}
                    disabled={!canUpdateConfig}
                    helper={
                      !canUpdateConfig
                        ? 'You need additional permissions to update authentication settings'
                        : undefined
                    }
                  />
                </div>
              </FormSectionContent>
            </FormSection>
          </>
        )
      }}
    </Form>
  )
}

export default TemplateEditor
