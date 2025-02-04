import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { get } from 'data/fetchers'
import { ResponseError } from 'types'
import { integrationKeys } from './keys'

export async function getGitHubRepositories(signal?: AbortSignal) {
  const { data, error } = await get('/platform/integrations/github/repositories', {
    signal,
  })
  if (error) throw new Error((error as ResponseError).message)

  // [Alaister]: temp fix until we have a proper response type
  return (data as any).repositories
}

export type GitHubRepositoriesData = Awaited<ReturnType<typeof getGitHubRepositories>>
export type ProjectGitHubRepositoryConnectionsData = Awaited<
  ReturnType<typeof getGitHubRepositories>
>
export type GitHubRepositoriesError = ResponseError

export const useGitHubRepositoriesQuery = <TData = GitHubRepositoriesData>({
  enabled = true,
  ...options
}: UseQueryOptions<GitHubRepositoriesData, GitHubRepositoriesError, TData> = {}) => {
  return useQuery<GitHubRepositoriesData, GitHubRepositoriesError, TData>(
    integrationKeys.githubRepositoriesList(),
    ({ signal }) => getGitHubRepositories(signal),
    { enabled, staleTime: 0, ...options }
  )
}
