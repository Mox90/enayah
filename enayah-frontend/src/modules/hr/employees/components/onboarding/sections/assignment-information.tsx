// 'use client'

// import { DatePicker } from '@/components/dialogs/date-picker'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'

// import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
// import { useTranslations } from 'next-intl'

// interface Props {
//   value: HireEmployeePayload
//   onChange: (value: HireEmployeePayload) => void
// }

// export function AssignmentInformation({ value, onChange }: Props) {
//   const ct = useTranslations('contracts')
//   const movement = value.movement

//   console.log('VALUE FIELD VALUE IS: ', value)
//   function updateMovement(field: keyof typeof movement, fieldValue: any) {
//     onChange({
//       ...value,
//       movement: {
//         ...movement,
//         [field]: fieldValue,
//       },
//     })
//   }

//   return (
//     <section className='space-y-4'>
//       <div>
//         <h3 className='text-lg font-semibold'>{ct('initialAssignment')}</h3>

//         <p className='text-sm text-muted-foreground'>
//           {ct('initialAssignmentSub')}
//         </p>
//       </div>

//       <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
//         <div className='space-y-2'>
//           <Label>{ct('pcnLabel')}</Label>

//           <Input
//             placeholder='Lookup vacant PCN...'
//             value={movement.positionItemId ?? ''}
//             onChange={(e) => updateMovement('positionItemId', e.target.value)}
//           />
//         </div>

//         <div className='space-y-2'>
//           <Label>{ct('department')}</Label>

//           <Input value={movement.officialDepartmentId ?? ''} disabled />
//         </div>

//         <div className='space-y-2'>
//           <Label>{ct('position')}</Label>

//           <Input value={movement.officialPositionId ?? ''} disabled />
//         </div>

//         <div className='space-y-2'>
//           {/* <Label>Effective Date</Label>

//           <Input
//             type='date'
//             value={movement.startDate ?? value.contract.startDate}
//             onChange={(e) => updateMovement('startDate', e.target.value)}
//           /> */}
//           <label
//             htmlFor={'startDate'}
//             className='text-xs text-muted-foreground block'
//           >
//             {ct('effectiveDate')}
//           </label>

//           <DatePicker
//             id='startDate'
//             value={movement.startDate ?? ''}
//             onChange={(value) => updateMovement('startDate', value ?? null)}
//           />
//         </div>
//       </div>
//     </section>
//   )
// }
