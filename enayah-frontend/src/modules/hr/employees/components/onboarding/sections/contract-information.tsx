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

// import { Textarea } from '@/components/ui/textarea'

// import { HireEmployeePayload } from '@/modules/hr/onboarding/types/onboarding.types'
// import { useTranslations } from 'next-intl'

// interface Props {
//   value: HireEmployeePayload
//   onChange: (value: HireEmployeePayload) => void
// }

// export function ContractInformation({ value, onChange }: Props) {
//   const ct = useTranslations('contracts')
//   const contract = value.contract

//   function updateContract(field: keyof typeof contract, fieldValue: any) {
//     console.log('CONTRACT FIELD VALUE IS ', fieldValue)
//     onChange({
//       ...value,
//       contract: {
//         ...contract,
//         [field]: fieldValue,
//       },
//     })
//   }

//   return (
//     <section className='space-y-4'>
//       <div>
//         <h3 className='text-lg font-semibold'>{ct('contractInfo')}</h3>

//         <p className='text-sm text-muted-foreground'>{ct('contractInfoSub')}</p>
//       </div>

//       <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
//         {/* <div className='space-y-2'>
//           <Label>Contract Number</Label>

//           <Input
//             value={contract.contractNumber ?? ''}
//             disabled
//             placeholder='Auto-generated upon hiring'
//           />
//         </div> */}

//         <div className='space-y-2'>
//           <Label>{ct('contractType')}</Label>

//           <Select
//             value={contract.contractType}
//             onValueChange={(v) => updateContract('contractType', v)}
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value='initial'>{ct('initial')}</SelectItem>
//               <SelectItem value='renewal'>{ct('renewal')}</SelectItem>
//               <SelectItem value='amendment'>{ct('amendment')}</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className='space-y-2'>
//           <Label>{ct('status')}</Label>

//           <Select
//             value={contract.status ?? 'active'}
//             onValueChange={(v) => updateContract('status', v)}
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>

//             <SelectContent>
//               <SelectItem value='draft'>{ct('draft')}</SelectItem>
//               <SelectItem value='active'>{ct('active')}</SelectItem>
//               <SelectItem value='superseded'>{ct('superseded')}</SelectItem>
//               <SelectItem value='cancelled'>{ct('cancelled')}</SelectItem>
//               <SelectItem value='expired'>{ct('expired')}</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className='space-y-2'>
//           <Label>Start Date *</Label>

//           <Input
//             type='date'
//             value={contract.startDate ?? ''}
//             onChange={(e) => updateContract('startDate', e.target.value)}
//           />
//         </div>

//         <div className='space-y-2'>
//           {/* <Label>{ct('startDate')}</Label>

//           <Input
//             type='date'
//             value={contract.endDate ?? ''}
//             onChange={(e) => updateContract('endDate', e.target.value)}
//           /> */}
//           <label
//             htmlFor={'startDate'}
//             className='text-xs text-muted-foreground block'
//           >
//             {ct('startDate')}
//           </label>

//           <DatePicker
//             id='startDate'
//             value={contract.endDate ?? ''}
//             onChange={(value) => updateContract('endDate', value ?? null)}
//           />
//         </div>

//         {/* <div className='space-y-2'>
//           <Label>Signed Date</Label>

//           <Input
//             type='date'
//             value={contract.signedDate ?? ''}
//             onChange={(e) => updateContract('signedDate', e.target.value)}
//           />
//         </div> */}
//       </div>

//       <div className='space-y-2'>
//         <Label>{ct('notes')}</Label>

//         <Textarea
//           value={contract.notes ?? ''}
//           onChange={(e) => updateContract('notes', e.target.value)}
//           rows={3}
//         />
//       </div>
//     </section>
//   )
// }
