export function toOnboardingResponse(result: any) {
  return {
    employee: result.employee,
    personal: result.personal,
    employment: result.employment,
    contract: result.contract,
    movement: result.movement,
    appointment: result.appointment,
    compensation: result.compensation,
    credentials: result.credentials,
  }
}
