// enayah-frontend/src/modules/hr/employees/components/profile/tabs/credentials-tab.tsx

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
  type DegreeFormSubmitValue,
  type DegreeFormValue,
} from '@/components/dialogs/degree-dialog'
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
import {
  BoardDialog,
  type BoardFormSubmitValue,
  type BoardFormValue,
} from '@/components/dialogs/board-dialog'
import {
  LicenseDialog,
  type LicenseFormSubmitValue,
  type LicenseFormValue,
} from '@/components/dialogs/license-dialog'
import {
  useCreateLicense,
  useDeleteLicense,
  useUpdateLicense,
} from '@/modules/hr/credentials/hooks/use-license-mutations'
import {
  FellowshipDialog,
  type FellowshipFormSubmitValue,
  type FellowshipFormValue,
} from '@/components/dialogs/fellowship-dialog'
import {
  useCreateFellowship,
  useDeleteFellowship,
  useUpdateFellowship,
} from '@/modules/hr/credentials/hooks/use-fellowship-mutations'
import {
  LifeSupportDialog,
  type LifeSupportFormSubmitValue,
  type LifeSupportFormValue,
} from '@/components/dialogs/life-support-dialog'
import {
  useCreateLifeSupport,
  useDeleteLifeSupport,
  useUpdateLifeSupport,
} from '@/modules/hr/credentials/hooks/use-lifesupport-mutations'
import {
  MembershipDialog,
  type MembershipFormSubmitValue,
  type MembershipFormValue,
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
  type MalpracticeFormSubmitValue,
  type MalpracticeFormValue,
} from '@/components/dialogs/malpractice-dialog'
import {
  CredentialVerificationDialog,
  CredentialVerificationDialogItem,
  type CredentialVerificationSubmitValue,
} from '@/components/dialogs/credential-verification-dialog'
import { useUpdateCredentialVerification } from '@/modules/hr/credentials/hooks/use-update-credential-verification'
import type { CredentialKind } from '@/modules/hr/credentials/config/credential-resource.config'

import { useAuthStore } from '@/modules/iam/stores/auth.store'
import { hasPermission } from '@/lib/permissions/hasPermission'
import { usePermission } from '@/hooks/usePermission'

type VerificationTarget = {
  kind: CredentialKind
  id: string
}

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
  //const [open, setOpen] = useState(false)

  // const [verificationCredentialId, setVerificationCredentialId] = useState<
  //   string | null
  // >(null)
  const [verificationTarget, setVerificationTarget] =
    useState<VerificationTarget | null>(null)

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

  const { data, isLoading, error } = useEmployeeCredentials(employeeId)

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

  const updateCredentialVerification =
    useUpdateCredentialVerification(employeeId)

  const canVerifyCredentials = usePermission('credential.verify') //permissions.includes('credential.verify')

  const verificationCredential: CredentialVerificationDialogItem | null =
    (() => {
      if (!verificationTarget || !data) {
        return null
      }

      const { kind, id } = verificationTarget

      switch (kind) {
        case 'degree': {
          const item = data.degrees.find((degree) => degree.id === id)

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.degreeName,
            subtitle: item.institution,
            descriptor: item.degreeType,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'board': {
          const item = data.boards.find((board) => board.id === id)

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.boardName,
            subtitle: item.issuingBody,
            descriptor: item.specialty ?? null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'fellowship': {
          const item = data.fellowships.find(
            (fellowship) => fellowship.id === id,
          )

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.fellowshipName,
            subtitle: item.issuingBody,
            descriptor: item.specialty ?? item.abbreviation ?? null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'membership': {
          const item = data.memberships.find(
            (membership) => membership.id === id,
          )

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.organization,
            subtitle: item.membershipNumber ?? null,
            descriptor: item.membershipLevel ?? null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'license': {
          const item = data.licenses.find((license) => license.id === id)

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.profession || item.licenseNumber,
            subtitle: item.authority,
            descriptor: item.specialty ?? null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'life-support': {
          const item = data.lifeSupport.find(
            (lifeSupport) => lifeSupport.id === id,
          )

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.type,
            subtitle: item.provider,
            descriptor: item.certificateNumber ?? null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }

        case 'malpractice': {
          const item = data.malpractice.find(
            (malpractice) => malpractice.id === id,
          )

          if (!item?.id) {
            return null
          }

          return {
            id: item.id,
            title: item.insuranceCompany,
            subtitle: item.policyNumber,
            descriptor: null,
            isVerified:
              item.verification?.isVerified ?? item.isVerified ?? false,
            document: item.document ?? null,
            verification: item.verification ?? null,
          }
        }
      }
    })()

  async function handleDegreeSubmit(
    value: DegreeFormSubmitValue,
  ): Promise<void> {
    const { id, ...payload } = value

    if (id) {
      await updateDegreeMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createDegreeMutation.mutateAsync(payload)
  }

  async function handleBoardSubmit(value: BoardFormSubmitValue): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateBoardMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createBoardMutation.mutateAsync(payload)
  }

  async function handleLicenseSubmit(
    value: LicenseFormSubmitValue,
  ): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateLicenseMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createLicenseMutation.mutateAsync(payload)
  }

  async function handleFellowshipSubmit(
    value: FellowshipFormSubmitValue,
  ): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateFellowshipMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createFellowshipMutation.mutateAsync(payload)
  }

  async function handleMembershipSubmit(
    value: MembershipFormSubmitValue,
  ): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateMembershipMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createMembershipMutation.mutateAsync(payload)
  }

  async function handleLifeSupportSubmit(
    value: LifeSupportFormSubmitValue,
  ): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateLifeSupportMutation.mutateAsync({
        id,
        ...payload,
      })

      return
    }

    await createLifeSupportMutation.mutateAsync(payload)
  }

  async function handleMalpracticeSubmit(
    value: MalpracticeFormSubmitValue,
  ): Promise<void> {
    const { id, clientId: _clientId, ...payload } = value

    if (id) {
      await updateMalpracticeMutation.mutateAsync({ id, ...payload })

      return
    }

    await createMalpracticeMutation.mutateAsync(payload)
  }

  async function handleCredentialVerificationSubmit(
    value: CredentialVerificationSubmitValue,
  ): Promise<void> {
    if (!verificationTarget) {
      return
    }

    await updateCredentialVerification.mutateAsync({
      kind: verificationTarget.kind,
      credentialId: verificationTarget.id,
      isVerified: value.isVerified,
      remarks: value.remarks,

      ...(value.evidenceFile
        ? {
            evidenceFile: value.evidenceFile,
          }
        : {}),
    })

    setVerificationTarget(null)
  }

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
      {/* {data?.degrees[0]?.id && (
        <Button
          type='button'
          disabled={updateDegreeVerification.isPending}
          onClick={() => {
            const degreeId = data.degrees[0]?.id

            if (!degreeId) {
              return
            }

            void testVerifyDegree(degreeId)
          }}
        >
          {updateDegreeVerification.isPending
            ? 'Verifying...'
            : 'Test degree verification'}
        </Button>
      )} */}

      <CredentialDegrees
        employeeId={employeeId}
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
            document: degree.document ?? null,
          })

          //setOpen(true)
          setActiveDialog('degree')
        }}
        onDelete={(id) => deleteDegreeMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'degree',
                  id,
                })
              },
            }
          : {})}
      />

      <DegreeDialog
        open={activeDialog === 'degree'}
        employeeId={employeeId}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingDegree(null)
          }
        }}
        initialValue={editingDegree}
        onSubmit={handleDegreeSubmit}
        allowDocumentUpload
      />

      <CredentialBoards
        employeeId={employeeId}
        boards={data?.boards ?? []}
        onAdd={() => {
          setEditingBoard(null)
          //setOpen(true)
          setActiveDialog('board')
        }}
        onEdit={(id) => {
          const board = data?.boards.find((item) => item.id === id)

          if (!board) return

          setEditingBoard({
            id: board.id,
            boardName: board.boardName,
            specialty: board.specialty ?? null,
            issuingBody: board.issuingBody,
            issueDate: board.issueDate ?? null,
            expiryDate: board.expiryDate ?? null,
            isLifetime: board.isLifetime ?? false,
            isVerified: board.isVerified ?? false,
            document: board.document ?? null,
          })

          setActiveDialog('board')
        }}
        //onDelete={(id) => deleteBoardMutation.mutate(id)}
        onDelete={(id) => deleteBoardMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'board',
                  id,
                })
              },
            }
          : {})}
      />

      <BoardDialog
        open={activeDialog === 'board'}
        employeeId={employeeId}
        initialValue={editingBoard}
        allowDocumentUpload
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingBoard(null)
          }
        }}
        onSubmit={handleBoardSubmit}
      />

      <CredentialLicenses
        employeeId={employeeId}
        licenses={data?.licenses ?? []}
        onAdd={() => {
          setEditingLicense(null)
          //setOpen(true)
          setActiveDialog('license')
        }}
        onEdit={(id) => {
          const license = data?.licenses.find((item) => item.id === id)
          if (!license) return
          setEditingLicense({
            id: license.id,
            licenseNumber: license.licenseNumber,
            authority: license.authority,
            specialty: license.specialty,
            profession: license.profession,
            issueDate: license.issueDate,
            expiryDate: license.expiryDate,
            //status: license.status,
            isPrimary: license.isPrimary,
            isVerified: license.isVerified ?? false,
            document: license.document ?? null,
          })

          //setOpen(true)
          setActiveDialog('license')
        }}
        onDelete={(id) => deleteLicenseMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'license',
                  id,
                })
              },
            }
          : {})}
      />

      <LicenseDialog
        open={activeDialog === 'license'}
        employeeId={employeeId}
        initialValue={editingLicense}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingLicense(null)
          }
        }}
        onSubmit={handleLicenseSubmit}
      />

      <CredentialFellowships
        employeeId={employeeId}
        fellowships={data?.fellowships ?? []}
        onAdd={() => {
          setEditingFellowship(null)
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
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'fellowship',
                  id,
                })
              },
            }
          : {})}
      />

      <FellowshipDialog
        open={activeDialog === 'fellowship'}
        employeeId={employeeId}
        initialValue={editingFellowship}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingFellowship(null)
          }
        }}
        onSubmit={handleFellowshipSubmit}
      />

      <CredentialMemberships
        employeeId={employeeId}
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
            isVerified: membership.isVerified ?? false,
          })

          setActiveDialog('membership')
        }}
        onDelete={(id) => deleteMembershipMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'membership',
                  id,
                })
              },
            }
          : {})}
      />

      <MembershipDialog
        open={activeDialog === 'membership'}
        employeeId={employeeId}
        initialValue={editingMembership}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingMembership(null)
          }
        }}
        onSubmit={handleMembershipSubmit}
      />

      <CredentialLifeSupport
        employeeId={employeeId}
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
            isVerified: lifeSupport.isVerified ?? false,
          })

          setActiveDialog('life_support')
        }}
        onDelete={(id) => deleteLifeSupportMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'life-support',
                  id,
                })
              },
            }
          : {})}
      />

      <LifeSupportDialog
        open={activeDialog === 'life_support'}
        employeeId={employeeId}
        initialValue={editingLifeSupport}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingLifeSupport(null)
          }
        }}
        onSubmit={handleLifeSupportSubmit}
      />

      <CredentialMalpractice
        employeeId={employeeId}
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
            isVerified: item.isVerified ?? false,
          })

          setActiveDialog('malpractice')
        }}
        onDelete={(id) => deleteMalpracticeMutation.mutate(id)}
        {...(canVerifyCredentials
          ? {
              onVerify: (id) => {
                setVerificationTarget({
                  kind: 'malpractice',
                  id,
                })
              },
            }
          : {})}
      />

      <MalpracticeDialog
        open={activeDialog === 'malpractice'}
        employeeId={employeeId}
        initialValue={editingMalpractice}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingMalpractice(null)
          }
        }}
        onSubmit={handleMalpracticeSubmit}
      />

      <CredentialVerificationDialog
        key={
          verificationTarget
            ? `${verificationTarget.kind}:${verificationTarget.id}`
            : 'credential-verification-closed'
        }
        open={verificationTarget !== null && verificationCredential !== null}
        credential={verificationCredential}
        isSubmitting={updateCredentialVerification.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setVerificationTarget(null)
          }
        }}
        onSubmit={handleCredentialVerificationSubmit}
      />
    </div>
  )
}

export default CredentialsTab
