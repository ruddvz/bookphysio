export class DashboardQueryError extends Error {
  status: number

  constructor(resource: string, status: number) {
    super(`${resource} request failed with status ${status}`)
    this.name = 'DashboardQueryError'
    this.status = status
  }
}

export function isDashboardAccessError(error: unknown): error is DashboardQueryError {
  return error instanceof DashboardQueryError && (error.status === 401 || error.status === 403)
}