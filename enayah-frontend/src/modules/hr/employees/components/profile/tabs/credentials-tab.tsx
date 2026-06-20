'use client'

import { useEmployeeCredentials } from '@/modules/hr/credentials/hooks/use-employee-credentials'
import { CredentialDegrees } from './cards/credential-degrees'
import { CredentialBoards } from './cards/credential-boards'
import { CredentialLicenses } from './cards/credential-licenses'
import { CredentialFellowships } from './cards/credential-fellowships'
import { CredentialMemberships } from './cards/credential-memberships'
import { CredentialLifeSupport } from './cards/credential-lifesupport'
import { CredentialMalpractice } from './cards/credential-malpractice'
import { useState } from 'react'
import {
  DegreeDialog,
  DegreeFormValue,
} from '@/components/dialogs/degree-dialog'
import {
  DegreeInput,
  MalpracticeInput,
} from '@/modules/hr/onboarding/types/onboarding.types'
import {
  useCreateDegree,
  useDeleteDegree,
  useUpdateDegree,
} from '@/modules/hr/credentials/hooks/use-degree-mutations'
import {
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard,
} from '@/modules/hr/credentials/hooks/use-board-mutations'
import { BoardDialog, BoardFormValue } from '@/components/dialogs/board-dialog'
import {
  LicenseDialog,
  LicenseFormValue,
} from '@/components/dialogs/license-dialog'
import {
  useCreateLicense,
  useDeleteLicense,
  useUpdateLicense,
} from '@/modules/hr/credentials/hooks/use-license-mutations'
import {
  FellowshipDialog,
  FellowshipFormValue,
} from '@/components/dialogs/fellowship-dialog'
import {
  useCreateFellowship,
  useDeleteFellowship,
  useUpdateFellowship,
} from '@/modules/hr/credentials/hooks/use-fellowship-mutations'
import {
  LifeSupportDialog,
  LifeSupportFormValue,
} from '@/components/dialogs/life-support-dialog'
import {
  useCreateLifeSupport,
  useDeleteLifeSupport,
  useUpdateLifeSupport,
} from '@/modules/hr/credentials/hooks/use-lifesupport-mutations'
import {
  MembershipDialog,
  MembershipFormValue,
} from '@/components/dialogs/membership-dialog'
import {
  useCreateMembership,
  useDeleteMembership,
  useUpdateMembership,
} from '@/modules/hr/credentials/hooks/use-membership-mutations'
import {
  useCreateMalpractice,
  useDeleteMalpractice,
  useUpdateMalpractice,
} from '@/modules/hr/credentials/hooks/use-malpractice-mutations'
import {
  MalpracticeDialog,
  MalpracticeFormValue,
} from '@/components/dialogs/malpractice-dialog'

interface Props {
  employeeId: string
}

const CredentialsTab = ({ employeeId }: Props) => {
  const [activeDialog, setActiveDialog] = useState<
    | 'degree'
    | 'board'
    | 'license'
    | 'fellowship'
    | 'membership'
    | 'life_support'
    | 'malpractice'
    | null
  >(null)
  const { data, isLoading, error, isError } = useEmployeeCredentials(employeeId)
  //const [open, setOpen] = useState(false)

  const [editingDegree, setEditingDegree] = useState<DegreeFormValue | null>(
    null,
  )
  const [editingBoard, setEditingBoard] = useState<BoardFormValue | null>(null)
  const [editingLicense, setEditingLicense] = useState<LicenseFormValue | null>(
    null,
  )
  const [editingFellowship, setEditingFellowship] =
    useState<FellowshipFormValue | null>(null)
  const [editingLifeSupport, setEditingLifeSupport] =
    useState<LifeSupportFormValue | null>(null)
  const [editingMembership, setEditingMembership] =
    useState<MembershipFormValue | null>(null)
  const [editingMalpractice, setEditingMalpractice] =
    useState<MalpracticeFormValue | null>(null)

  const createDegreeMutation = useCreateDegree(employeeId)
  const updateDegreeMutation = useUpdateDegree(employeeId)
  const deleteDegreeMutation = useDeleteDegree(employeeId)

  const createBoardMutation = useCreateBoard(employeeId)
  const updateBoardMutation = useUpdateBoard(employeeId)
  const deleteBoardMutation = useDeleteBoard(employeeId)

  const createLicenseMutation = useCreateLicense(employeeId)
  const updateLicenseMutation = useUpdateLicense(employeeId)
  const deleteLicenseMutation = useDeleteLicense(employeeId)

  const createFellowshipMutation = useCreateFellowship(employeeId)
  const updateFellowshipMutation = useUpdateFellowship(employeeId)
  const deleteFellowshipMutation = useDeleteFellowship(employeeId)

  const createLifeSupportMutation = useCreateLifeSupport(employeeId)
  const updateLifeSupportMutation = useUpdateLifeSupport(employeeId)
  const deleteLifeSupportMutation = useDeleteLifeSupport(employeeId)

  const createMembershipMutation = useCreateMembership(employeeId)
  const updateMembershipMutation = useUpdateMembership(employeeId)
  const deleteMembershipMutation = useDeleteMembership(employeeId)

  const createMalpracticeMutation = useCreateMalpractice(employeeId)
  const updateMalpracticeMutation = useUpdateMalpractice(employeeId)
  const deleteMalpracticeMutation = useDeleteMalpractice(employeeId)

  //console.log(data.credentials, isLoading, error, isError)

  if (isLoading) {
    return <div className='p-8 text-center'>Loading credentials...</div>
  }

  if (error) {
    return (
      <div className='p-8 text-center text-red-600'>
        Failed to load credentials
      </div>
    )
  }
  //const c = data?.credentials

  return (
    <div className='space-y-6'>
      {/* <CredentialDegrees degrees={data?.degrees ?? []} /> */}
      <CredentialDegrees
        degrees={data?.degrees ?? []}
        onAdd={() => {
          setEditingDegree(null)
          //setOpen(true)
          setActiveDialog('degree')
        }}
        onEdit={(id) => {
          const degree = data?.degrees.find((d) => d.id === id)

          if (!degree) return

          setEditingDegree({
            id: degree.id,
            degreeType: degree.degreeType,
            degreeName: degree.degreeName,
            major: degree.major ?? null,
            institution: degree.institution,
            graduationDate: degree.graduationDate ?? null,
            isVerified: degree.isVerified ?? false,
          })

          //setOpen(true)
          setActiveDialog('degree')
        }}
        onDelete={(id) => deleteDegreeMutation.mutate(id)}
      />

      <DegreeDialog
        open={activeDialog === 'degree'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingDegree}
        onSubmit={async (form) => {
          if (editingDegree?.id) {
            await updateDegreeMutation.mutateAsync({
              id: editingDegree.id,
              degreeType: form.degreeType,
              degreeName: form.degreeName,
              major: form.major ?? null,
              institution: form.institution,
              graduationDate: form.graduationDate ?? null,
              isVerified: form.isVerified ?? false,
            })
          } else {
            await createDegreeMutation.mutateAsync({
              degreeType: form.degreeType,
              degreeName: form.degreeName,
              major: form.major ?? null,
              institution: form.institution,
              graduationDate: form.graduationDate ?? null,
              isVerified: form.isVerified ?? false,
            })
          }
        }}
      />

      <CredentialBoards
        boards={data?.boards ?? []}
        onAdd={() => {
          setEditingBoard(null)
          //setOpen(true)
          setActiveDialog('board')
        }}
        onEdit={(id) => {
          const board = data?.boards.find((b) => b.id === id)
          if (!board) return
          setEditingBoard({
            id: board.id,
            boardName: board.boardName,
            specialty: board.specialty,
            issuingBody: board.issuingBody,
            issueDate: board.issueDate,
            expiryDate: board.expiryDate,
            isLifetime: board.isLifetime,
            isVerified: board.isVerified,
          })

          //setOpen(true)
          setActiveDialog('board')
        }}
        onDelete={(id) => deleteBoardMutation.mutate(id)}
      />

      <BoardDialog
        open={activeDialog === 'board'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingBoard}
        onSubmit={async (form) => {
          if (editingBoard?.id) {
            await updateBoardMutation.mutateAsync({
              id: editingBoard.id,
              boardName: form.boardName,
              specialty: form.specialty,
              issuingBody: form.issuingBody,
              issueDate: form.issueDate,
              expiryDate: form.expiryDate,
              isLifetime: form.isLifetime ?? false,
              isVerified: form.isVerified ?? false,
            })
          } else {
            await createBoardMutation.mutateAsync({
              boardName: form.boardName,
              specialty: form.specialty,
              issuingBody: form.issuingBody,
              issueDate: form.issueDate,
              expiryDate: form.expiryDate,
              isLifetime: form.isLifetime ?? false,
              isVerified: form.isVerified ?? false,
            })
          }
        }}
      />

      <CredentialLicenses
        licenses={data?.licenses ?? []}
        onAdd={() => {
          setEditingBoard(null)
          //setOpen(true)
          setActiveDialog('license')
        }}
        onEdit={(id) => {
          const license = data?.licenses.find((b) => b.id === id)
          if (!license) return
          setEditingLicense({
            id: license.id,
            licenseNumber: license.licenseNumber,
            authority: license.authority,
            specialty: license.specialty,
            profession: license.profession,
            issueDate: license.issueDate,
            expiryDate: license.expiryDate,
            status: license.status,
            isPrimary: license.isPrimary,
          })

          //setOpen(true)
          setActiveDialog('license')
        }}
        onDelete={(id) => deleteLicenseMutation.mutate(id)}
      />

      <LicenseDialog
        open={activeDialog === 'license'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingLicense}
        onSubmit={async (form) => {
          if (editingLicense?.id) {
            await updateLicenseMutation.mutateAsync({
              id: editingLicense.id,
              licenseNumber: form.licenseNumber,
              specialty: form.specialty,
              authority: form.authority,
              issueDate: form.issueDate,
              expiryDate: form.expiryDate,
              profession: form.profession,
              status: form.status,
              isPrimary: form.isPrimary ?? false,
            })
          } else {
            await createLicenseMutation.mutateAsync({
              licenseNumber: form.licenseNumber,
              specialty: form.specialty,
              authority: form.authority,
              issueDate: form.issueDate,
              expiryDate: form.expiryDate,
              profession: form.profession,
              status: form.status,
              isPrimary: form.isPrimary ?? false,
            })
          }
        }}
      />

      <CredentialFellowships
        fellowships={data?.fellowships ?? []}
        onAdd={() => {
          setEditingBoard(null)
          //setOpen(true)
          setActiveDialog('fellowship')
        }}
        onEdit={(id) => {
          const fellowship = data?.fellowships.find((item) => item.id === id)
          if (!fellowship) return

          setEditingFellowship({
            id: fellowship.id,
            fellowshipName: fellowship.fellowshipName,
            abbreviation: fellowship.abbreviation ?? null,
            issuingBody: fellowship.issuingBody,
            specialty: fellowship.specialty ?? null,
            issueDate: fellowship.issueDate ?? null,
            expiryDate: fellowship.expiryDate ?? null,
            //documentFileId: fellowship.documentFileId ?? null,
            isVerified: fellowship.isVerified ?? false,
          })

          setActiveDialog('fellowship')
        }}
        onDelete={(id) => deleteFellowshipMutation.mutate(id)}
      />

      <FellowshipDialog
        open={activeDialog === 'fellowship'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingFellowship}
        onSubmit={async (form) => {
          if (editingFellowship?.id) {
            await updateFellowshipMutation.mutateAsync({
              id: editingFellowship.id,
              fellowshipName: form.fellowshipName,
              abbreviation: form.abbreviation ?? null,
              issuingBody: form.issuingBody,
              specialty: form.specialty ?? null,
              issueDate: form.issueDate ?? null,
              expiryDate: form.expiryDate ?? null,
              documentFileId: form.documentFileId ?? null,
              isVerified: form.isVerified ?? false,
            })
          } else {
            await createFellowshipMutation.mutateAsync({
              fellowshipName: form.fellowshipName,
              abbreviation: form.abbreviation ?? null,
              issuingBody: form.issuingBody,
              specialty: form.specialty ?? null,
              issueDate: form.issueDate ?? null,
              expiryDate: form.expiryDate ?? null,
              documentFileId: form.documentFileId ?? null,
              isVerified: form.isVerified ?? false,
            })
          }
        }}
      />

      <CredentialMemberships
        memberships={data?.memberships ?? []}
        onAdd={() => {
          setEditingMembership(null)
          setActiveDialog('membership')
        }}
        onEdit={(id) => {
          const membership = data?.memberships.find((item) => item.id === id)
          if (!membership) return

          setEditingMembership({
            id: membership.id,
            organization: membership.organization,
            membershipNumber: membership.membershipNumber ?? null,
            membershipLevel: membership.membershipLevel ?? null,
            startDate: membership.startDate ?? null,
            expiryDate: membership.expiryDate ?? null,
            documentFileId: membership.documentFileId ?? null,
            isVerified: membership.isVerified ?? false,
          })

          setActiveDialog('membership')
        }}
        onDelete={(id) => deleteMembershipMutation.mutate(id)}
      />

      <MembershipDialog
        open={activeDialog === 'membership'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingMembership}
        onSubmit={async (form) => {
          if (editingMembership?.id) {
            await updateMembershipMutation.mutateAsync({
              id: editingMembership.id,
              organization: form.organization,
              membershipNumber: form.membershipNumber ?? null,
              membershipLevel: form.membershipLevel ?? null,
              startDate: form.startDate ?? null,
              expiryDate: form.expiryDate ?? null,
              isVerified: form.isVerified ?? false,
              documentFileId: form.documentFileId ?? null,
            })
          } else {
            await createMembershipMutation.mutateAsync({
              organization: form.organization,
              membershipNumber: form.membershipNumber ?? null,
              membershipLevel: form.membershipLevel ?? null,
              startDate: form.startDate ?? null,
              expiryDate: form.expiryDate ?? null,
              isVerified: form.isVerified ?? false,
              documentFileId: form.documentFileId ?? null,
            })
          }
        }}
      />

      <CredentialLifeSupport
        lifeSupports={data?.lifeSupport ?? []}
        onAdd={() => {
          setEditingLifeSupport(null)
          setActiveDialog('life_support')
        }}
        onEdit={(id) => {
          const lifeSupport = data?.lifeSupport.find((item) => item.id === id)
          if (!lifeSupport) return

          setEditingLifeSupport({
            id: lifeSupport.id,
            type: lifeSupport.type,
            provider: lifeSupport.provider,
            certificateNumber: lifeSupport.certificateNumber ?? null,
            issueDate: lifeSupport.issueDate ?? null,
            expiryDate: lifeSupport.expiryDate,
            documentFileId: lifeSupport.documentFileId ?? null,
            isVerified: lifeSupport.isVerified ?? false,
          })

          setActiveDialog('life_support')
        }}
        onDelete={(id) => deleteLifeSupportMutation.mutate(id)}
      />

      <LifeSupportDialog
        open={activeDialog === 'life_support'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingLifeSupport}
        onSubmit={async (form) => {
          if (editingLifeSupport?.id) {
            await updateLifeSupportMutation.mutateAsync({
              id: editingLifeSupport.id,
              type: form.type,
              provider: form.provider,
              certificateNumber: form.certificateNumber ?? null,
              issueDate: form.issueDate ?? null,
              expiryDate: form.expiryDate,
              isVerified: form.isVerified ?? false,
              documentFileId: form.documentFileId ?? null,
            })
          } else {
            await createLifeSupportMutation.mutateAsync({
              type: form.type,
              provider: form.provider,
              certificateNumber: form.certificateNumber ?? null,
              issueDate: form.issueDate ?? null,
              expiryDate: form.expiryDate,
              isVerified: form.isVerified ?? false,
              documentFileId: form.documentFileId ?? null,
            })
          }
        }}
      />

      <CredentialMalpractice
        malpractice={data?.malpractice ?? []}
        onAdd={() => {
          setEditingMalpractice(null)
          setActiveDialog('malpractice')
        }}
        onEdit={(id) => {
          const item = data?.malpractice.find((x) => x.id === id)
          if (!item) return

          setEditingMalpractice({
            id: item.id,
            insuranceCompany: item.insuranceCompany,
            policyNumber: item.policyNumber,
            coverageAmount: item.coverageAmount ?? null,
            startDate: item.startDate ?? null,
            expiryDate: item.expiryDate ?? null,
            documentFileId: item.documentFileId ?? null,
            isVerified: item.isVerified ?? false,
          })

          setActiveDialog('malpractice')
        }}
        onDelete={(id) => deleteMalpracticeMutation.mutate(id)}
      />

      <MalpracticeDialog
        open={activeDialog === 'malpractice'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingMalpractice}
        onSubmit={async (form) => {
          if (editingMalpractice?.id) {
            await updateMalpracticeMutation.mutateAsync({
              id: editingMalpractice.id,
              insuranceCompany: form.insuranceCompany,
              policyNumber: form.policyNumber,
              coverageAmount: form.coverageAmount ?? null,
              startDate: form.startDate ?? null,
              expiryDate: form.expiryDate ?? null,
              isVerified: form.isVerified ?? false,
            })
          } else {
            await createMalpracticeMutation.mutateAsync({
              insuranceCompany: form.insuranceCompany,
              policyNumber: form.policyNumber,
              coverageAmount: form.coverageAmount ?? null,
              startDate: form.startDate ?? null,
              expiryDate: form.expiryDate ?? null,
              isVerified: form.isVerified ?? false,
            })
          }
        }}
      />
    </div>
  )
}

export default CredentialsTab
