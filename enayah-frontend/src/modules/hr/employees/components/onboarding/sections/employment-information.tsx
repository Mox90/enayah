// 'use client'

// import { DatePicker } from '@/components/dialogs/date-picker'
// import { Input } from '@/components/ui/input'

// import { Label } from '@/components/ui/label'

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'

// import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
// import { useTranslations } from 'next-intl'

// interface Props {
//   value: HireEmployeePayload
//   onChange: (value: HireEmployeePayload) => void
// }

// export function EmploymentInformation({ value, onChange }: Props) {
//   const ct = useTranslations('contracts')
//   const employment = value.employment

//   function updateEmployment(field: keyof typeof employment, fieldValue: any) {
//     console.log('EMPLOYMENT FIELD VALUE IS ', fieldValue)
//     onChange({
//       ...value,

//       employment: {
//         ...employment,

//         [field]: fieldValue,
//       },
//     })
//   }

//   return (
//     <section className='space-y-4'>
//       <div>
//         <h3 className='text-lg font-semibold'>{ct('employmentInfo')}</h3>

//         <p className='text-sm text-muted-foreground'>
//           {ct('employmentInfoSub')}
//         </p>
//       </div>

//       <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
//         <div className='space-y-2'>
//           {/* <Label>Hire Date *</Label>

//           <Input
//             type='date'
//             value={employment.hireDate ?? ''}
//             onChange={(e) => updateEmployment('hireDate', e.target.value)}
//           /> */}
//           <label
//             htmlFor={'hireDate'}
//             className='text-xs text-muted-foreground block'
//           >
//             {ct('hireDate')}
//           </label>

//           <DatePicker
//             id='hireDate'
//             value={employment.hireDate ?? ''}
//             onChange={(value) => updateEmployment('hireDate', value ?? '')}
//           />
//         </div>

//         <div className='space-y-2'>
//           {/* <Label>Start Date *</Label>

//           <Input
//             type='date'
//             value={employment.startDate ?? ''}
//             onChange={(e) => updateEmployment('startDate', e.target.value)}
//           /> */}
//           <label
//             htmlFor={'startDate'}
//             className='text-xs text-muted-foreground block'
//           >
//             {ct('startDate')}
//           </label>

//           <DatePicker
//             id='startDate'
//             value={employment.startDate ?? ''}
//             onChange={(value) => updateEmployment('startDate', value ?? '')}
//           />
//         </div>

//         {/* <div className='space-y-2'>
//           <Label>End Date</Label>

//           <Input
//             type='date'
//             value={employment.endDate ?? ''}
//             onChange={(e) => updateEmployment('endDate', e.target.value)}
//           />
//         </div> */}

//         <div className='space-y-2'>
//           <Label>{ct('employmentType')}</Label>

//           <Select
//             value={employment.employmentType}
//             onValueChange={(v) => updateEmployment('employmentType', v)}
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value='full_time'>{ct('fullTime')}</SelectItem>
//               <SelectItem value='part_time'>{ct('partTime')}</SelectItem>
//               <SelectItem value='contract'>{ct('contractual')}</SelectItem>
//               <SelectItem value='temporary'>{ct('temporary')}</SelectItem>
//               <SelectItem value='locum'>{ct('locum')}</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className='space-y-2'>
//           <Label>{ct('staffCategory')}</Label>

//           <Select
//             value={employment.staffCategory}
//             onValueChange={(v) => updateEmployment('staffCategory', v)}
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value='civilian'>{ct('civilian')}</SelectItem>
//               <SelectItem value='military'>{ct('military')}</SelectItem>
//               <SelectItem value='contractual'>{ct('contractual')}</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </section>
//   )
// }
