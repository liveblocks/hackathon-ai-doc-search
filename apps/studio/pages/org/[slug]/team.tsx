import { TeamSettings } from 'components/interfaces/Organization'
import { OrganizationLayout } from 'components/layouts'
import { Loading } from 'components/ui/Loading'
import { usePermissionsQuery } from 'data/permissions/permissions-query'
import { useSelectedOrganization } from 'hooks'
import { NextPageWithLayout } from 'types'

const OrgTeamSettings: NextPageWithLayout = () => {
  const { isLoading: isLoadingPermissions } = usePermissionsQuery()
  const selectedOrganization = useSelectedOrganization()

  return (
    <>
      {selectedOrganization === undefined && isLoadingPermissions ? <Loading /> : <TeamSettings />}
    </>
  )
}

OrgTeamSettings.getLayout = (page) => <OrganizationLayout>{page}</OrganizationLayout>
export default OrgTeamSettings
