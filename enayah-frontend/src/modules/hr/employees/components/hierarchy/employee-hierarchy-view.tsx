// 'use client'

// import { useOrganizationView } from '../../hooks/use-organization-view'
// import { DepartmentNode } from './department-node'

// export function EmployeeHierarchyView() {
//   const { data, isLoading, isError, refetch } = useOrganizationView()

//   if (isLoading) {
//     return <div className='rounded-lg border p-8'>Loading...</div>
//   }

//   if (isError) {
//     return (
//       <div className='rounded-lg border p-8'>
//         Failed to load hierarchy.
//         <button
//           type='button'
//           onClick={() => refetch()}
//           className='ml-2 underline'
//         >
//           Retry
//         </button>
//       </div>
//     )
//   }

//   if (!data?.length) {
//     return <div className='rounded-lg border p-8'>No departments found.</div>
//   }

//   return (
//     <div className='rounded-lg border p-4'>
//       {data?.map((department: any) => (
//         <DepartmentNode key={department.id} node={department} />
//       ))}
//     </div>
//   )
// }
