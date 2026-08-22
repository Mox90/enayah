// enayah-frontend/src/modules/hr/employees/components/onboarding/steps/credentials-step.tsx

'use client'

import {
  BoardInput,
  DegreeInput,
  HireEmployeePayload,
  LicenseInput,
  LifeSupportInput,
  MembershipInput,
  MalpracticeInput,
  FellowshipInput,
} from '@/modules/hr/onboarding/types/onboarding.types'
import { CredentialDegrees } from '../../profile/tabs/cards/credential-degrees'
import { CredentialBoards } from '../../profile/tabs/cards/credential-boards'
import { CredentialLicenses } from '../../profile/tabs/cards/credential-licenses'
import { CredentialFellowships } from '../../profile/tabs/cards/credential-fellowships'
import { CredentialMemberships } from '../../profile/tabs/cards/credential-memberships'
import { CredentialLifeSupport } from '../../profile/tabs/cards/credential-lifesupport'
import { CredentialMalpractice } from '../../profile/tabs/cards/credential-malpractice'
import {
  DegreeDialog,
  type DegreeFormSubmitValue,
  type DegreeFormValue,
} from '@/components/dialogs/degree-dialog'
import { useState } from 'react'
import {
  BoardDialog,
  BoardFormSubmitValue,
  BoardFormValue,
} from '@/components/dialogs/board-dialog'
import {
  LicenseDialog,
  LicenseFormSubmitValue,
  LicenseFormValue,
} from '@/components/dialogs/license-dialog'
import {
  FellowshipDialog,
  FellowshipFormValue,
} from '@/components/dialogs/fellowship-dialog'
import {
  LifeSupportDialog,
  LifeSupportFormSubmitValue,
  LifeSupportFormValue,
} from '@/components/dialogs/life-support-dialog'
import {
  MembershipDialog,
  MembershipFormSubmitValue,
  MembershipFormValue,
} from '@/components/dialogs/membership-dialog'
import {
  MalpracticeDialog,
  MalpracticeFormSubmitValue,
  MalpracticeFormValue,
} from '@/components/dialogs/malpractice-dialog'

interface Props {
  value: HireEmployeePayload
  onChange: (value: HireEmployeePayload) => void
}

export function CredentialsStep({ value, onChange }: Props) {
  //const [degreeDialogOpen, setDegreeDialogOpen] = useState(false)
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

  //const degrees = value.credentials?.degrees ?? []
  const degrees = value.credentials?.degrees ?? []
  const boards = value.credentials?.boards ?? []
  const licenses = value.credentials?.licenses ?? []
  const fellowships = value.credentials?.fellowships ?? []
  const lifeSupports = value.credentials?.lifeSupport ?? []
  const memberships = value.credentials?.memberships ?? []
  const malpractice = value.credentials?.malpractice ?? []

  function saveDegree(form: DegreeFormSubmitValue): void {
    /*
     * The onboarding payload is JSON-based and cannot contain
     * a browser File object.
     *
     * File uploading is disabled for this dialog usage, so
     * documentFile should always be null here.
     */
    const degree: DegreeFormValue = {
      ...(form.id ? { id: form.id } : {}),

      degreeType: form.degreeType,
      degreeName: form.degreeName,
      major: form.major,
      institution: form.institution,
      graduationDate: form.graduationDate,

      isVerified: false,
    }

    const exists = degrees.some((item: DegreeInput) => item.id === degree.id)

    const nextDegrees = exists
      ? degrees.map((item: DegreeInput) =>
          item.id === degree.id ? degree : item,
        )
      : [...degrees, degree]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        degrees: nextDegrees,
      },
    })
  }

  function deleteDegree(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        degrees: degrees.filter((item: DegreeInput) => item.id !== id),
      },
    })
  }

  function saveBoard(boardValue: BoardFormSubmitValue) {
    const { clientId, id, documentFile: _documentFile, ...form } = boardValue

    const localId = clientId ?? id

    if (!localId) {
      return
    }

    const board: BoardInput = {
      id: localId,
      ...form,
    }

    const exists = boards.some((item) => item.id === localId)

    const nextBoards = exists
      ? boards.map((item) => (item.id === localId ? board : item))
      : [...boards, board]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        boards: nextBoards,
      },
    })
  }

  function deleteBoard(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        boards: boards.filter((item: BoardInput) => item.id !== id),
      },
    })
  }

  function saveLicense(licenseValue: LicenseFormSubmitValue) {
    const { clientId, id, documentFile: _documentFile, ...form } = licenseValue

    const localId = clientId ?? id

    if (!localId || !form.expiryDate) {
      return
    }

    const license: LicenseInput = {
      id: localId,
      authority: form.authority,
      licenseNumber: form.licenseNumber,
      profession: form.profession,
      specialty: form.specialty ?? null,
      issueDate: form.issueDate ?? null,
      expiryDate: form.expiryDate,
      isPrimary: form.isPrimary,
      isVerified: false,
    }

    const exists = licenses.some((item) => item.id === localId)

    const nextLicenses: LicenseInput[] = exists
      ? licenses.map((item) => (item.id === localId ? license : item))
      : [...licenses, license]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        licenses: nextLicenses,
      },
    })
  }

  function deleteLicense(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        licenses: licenses.filter((item: LicenseInput) => item.id !== id),
      },
    })
  }

  function saveFellowship(fellowshipValue: FellowshipFormValue) {
    const fellowship: FellowshipInput = {
      ...fellowshipValue,
      isVerified: false,
    }

    const exists = fellowships.some((item) => item.id === fellowship.id)

    const nextFellowships = exists
      ? fellowships.map((item) =>
          item.id === fellowship.id ? fellowship : item,
        )
      : [...fellowships, fellowship]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        fellowships: nextFellowships,
      },
    })
  }

  function deleteFellowship(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        fellowships: fellowships.filter((item) => item.id !== id),
      },
    })
  }

  // function saveLifeSupport(lifeSupport: LifeSupportFormValue) {
  //   const exists = lifeSupports.some(
  //     (item: LifeSupportInput) => item.id === lifeSupport.id,
  //   )

  //   const nextLifeSupports: LifeSupportInput[] = exists
  //     ? lifeSupports.map((item: LifeSupportInput) =>
  //         item.id === lifeSupport.id ? lifeSupport : item,
  //       )
  //     : [...lifeSupports, lifeSupport]

  //   onChange({
  //     ...value,
  //     credentials: {
  //       ...(value.credentials ?? {}),
  //       lifeSupport: nextLifeSupports,
  //     },
  //   })
  // }
  function saveLifeSupport(lifeSupportValue: LifeSupportFormSubmitValue) {
    const {
      clientId,
      id,
      documentFile: _documentFile,
      ...form
    } = lifeSupportValue

    const localId = clientId ?? id

    if (!localId) {
      return
    }

    const lifeSupport: LifeSupportInput = {
      id: localId,
      type: form.type,
      provider: form.provider,
      certificateNumber: form.certificateNumber ?? null,
      issueDate: form.issueDate ?? null,
      expiryDate: form.expiryDate,
      isVerified: false,
    }

    const exists = lifeSupports.some((item) => item.id === localId)

    const nextLifeSupports: LifeSupportInput[] = exists
      ? lifeSupports.map((item) => (item.id === localId ? lifeSupport : item))
      : [...lifeSupports, lifeSupport]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        lifeSupport: nextLifeSupports,
      },
    })
  }

  function deleteLifeSupport(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        lifeSupport: lifeSupports.filter(
          (item: LifeSupportInput) => item.id !== id,
        ),
      },
    })
  }

  function saveMembership(membershipValue: MembershipFormSubmitValue) {
    const {
      clientId,
      id,
      documentFile: _documentFile,
      ...form
    } = membershipValue

    const localId = clientId ?? id

    if (!localId) {
      return
    }

    const membership: MembershipInput = {
      id: localId,
      organization: form.organization,
      membershipNumber: form.membershipNumber ?? null,
      membershipLevel: form.membershipLevel ?? null,
      startDate: form.startDate ?? null,
      expiryDate: form.expiryDate ?? null,
      isVerified: false,
    }

    const exists = memberships.some((item) => item.id === localId)

    const nextMemberships: MembershipInput[] = exists
      ? memberships.map((item) => (item.id === localId ? membership : item))
      : [...memberships, membership]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        memberships: nextMemberships,
      },
    })
  }

  function deleteMembership(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        memberships: memberships.filter(
          (item: MembershipInput) => item.id !== id,
        ),
      },
    })
  }

  function saveMalpractice(malpracticeValue: MalpracticeFormSubmitValue) {
    const {
      clientId,
      id,
      documentFile: _documentFile,
      ...form
    } = malpracticeValue

    const localId = clientId ?? id

    if (!localId) {
      return
    }

    const item: MalpracticeInput = {
      id: localId,
      insuranceCompany: form.insuranceCompany,
      policyNumber: form.policyNumber,
      coverageAmount: form.coverageAmount ?? null,
      startDate: form.startDate ?? null,
      expiryDate: form.expiryDate,
      isVerified: false,
    }

    const exists = malpractice.some((x) => x.id === localId)

    const nextMalpractice: MalpracticeInput[] = exists
      ? malpractice.map((x) => (x.id === localId ? item : x))
      : [...malpractice, item]

    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        malpractice: nextMalpractice,
      },
    })
  }

  function deleteMalpractice(id: string) {
    onChange({
      ...value,
      credentials: {
        ...(value.credentials ?? {}),
        malpractice: malpractice.filter((x: MalpracticeInput) => x.id !== id),
      },
    })
  }

  return (
    <div className='space-y-6'>
      <CredentialDegrees
        degrees={degrees}
        onAdd={() => {
          setEditingDegree(null)
          //setDegreeDialogOpen(true)
          setActiveDialog('degree')
        }}
        onEdit={(id) => {
          //const degree = degrees.find((item: DegreeInput) => item.id === id)
          const degree = degrees.find((item) => item.id === id)
          if (!degree) return
          setEditingDegree({
            id: degree.id,
            degreeName: degree.degreeName,
            degreeType: degree.degreeType,
            major: degree.major,
            institution: degree.institution,
            graduationDate: degree.graduationDate,
            isVerified: degree.isVerified,
          })
          //setDegreeDialogOpen(true)
          setActiveDialog('degree')
        }}
        onDelete={deleteDegree}
      />

      <DegreeDialog
        open={activeDialog === 'degree'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingDegree(null)
          }
        }}
        initialValue={editingDegree}
        onSubmit={saveDegree}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialBoards
        boards={boards}
        onAdd={() => {
          setEditingBoard(null)
          setActiveDialog('board')
        }}
        onEdit={(id) => {
          const board = boards.find((item) => item.id === id)
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
          })
          setActiveDialog('board')
        }}
        onDelete={deleteBoard}
      />

      <BoardDialog
        open={activeDialog === 'board'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingBoard}
        onSubmit={saveBoard}
        //generateId={true}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialLicenses
        licenses={licenses}
        onAdd={() => {
          setEditingLicense(null)
          setActiveDialog('license')
        }}
        onEdit={(id) => {
          const license = licenses.find((item) => item.id === id)
          if (!license) return
          setEditingLicense({
            id: license.id,
            licenseNumber: license.licenseNumber,
            authority: license.authority,
            profession: license.profession,
            specialty: license.specialty ?? null,
            issueDate: license.issueDate ?? null,
            expiryDate: license.expiryDate,
            //status: license.status ?? 'active',
            isPrimary: license.isPrimary ?? false,
          })
          setActiveDialog('license')
        }}
        onDelete={deleteLicense}
      />

      <LicenseDialog
        open={activeDialog === 'license'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingLicense}
        onSubmit={saveLicense}
        //generateId={true}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialFellowships
        fellowships={fellowships}
        onAdd={() => {
          setEditingFellowship(null)
          setActiveDialog('fellowship')
        }}
        onEdit={(id) => {
          const fellowship = fellowships.find((item) => item.id === id)
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
        onDelete={deleteFellowship}
      />

      <FellowshipDialog
        open={activeDialog === 'fellowship'}
        onOpenChange={(open) => {
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingFellowship}
        onSubmit={saveFellowship}
        //generateId={true}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialMemberships
        memberships={memberships}
        onAdd={() => {
          setEditingMembership(null)
          setActiveDialog('membership')
        }}
        onEdit={(id) => {
          const membership = memberships.find((item) => item.id === id)
          if (!membership) return

          setEditingMembership({
            id: membership.id,
            organization: membership.organization,
            membershipNumber: membership.membershipNumber ?? null,
            membershipLevel: membership.membershipLevel ?? null,
            startDate: membership.startDate ?? null,
            expiryDate: membership.expiryDate ?? null,
            //documentFileId: membership.documentFileId ?? null,
            isVerified: membership.isVerified ?? false,
          })

          setActiveDialog('membership')
        }}
        onDelete={deleteMembership}
      />

      <MembershipDialog
        open={activeDialog === 'membership'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingMembership(null)
          }
        }}
        initialValue={editingMembership}
        onSubmit={saveMembership}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialLifeSupport
        lifeSupports={lifeSupports}
        onAdd={() => {
          setEditingLifeSupport(null)
          setActiveDialog('life_support')
        }}
        onEdit={(id) => {
          const lifeSupport = lifeSupports.find((item) => item.id === id)
          if (!lifeSupport) return

          setEditingLifeSupport({
            id: lifeSupport.id,
            type: lifeSupport.type,
            provider: lifeSupport.provider,
            certificateNumber: lifeSupport.certificateNumber ?? null,
            issueDate: lifeSupport.issueDate ?? null,
            expiryDate: lifeSupport.expiryDate,
            //documentFileId: lifeSupport.documentFileId ?? null,
            isVerified: lifeSupport.isVerified ?? false,
          })

          setActiveDialog('life_support')
        }}
        onDelete={deleteLifeSupport}
      />

      <LifeSupportDialog
        open={activeDialog === 'life_support'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingLifeSupport(null)
          }
        }}
        initialValue={editingLifeSupport}
        onSubmit={saveLifeSupport}
        // generateId={true}
        generateId
        allowDocumentUpload={false}
      />

      <CredentialMalpractice
        malpractice={malpractice}
        onAdd={() => {
          setEditingMalpractice(null)
          setActiveDialog('malpractice')
        }}
        onEdit={(id) => {
          const item = malpractice.find((x) => x.id === id)
          if (!item) return

          setEditingMalpractice({
            id: item.id,
            insuranceCompany: item.insuranceCompany,
            policyNumber: item.policyNumber,
            coverageAmount: item.coverageAmount ?? null,
            startDate: item.startDate ?? null,
            expiryDate: item.expiryDate ?? null,
            //documentFileId: item.documentFileId ?? null,
            isVerified: item.isVerified ?? false,
          })

          setActiveDialog('malpractice')
        }}
        onDelete={deleteMalpractice}
      />

      <MalpracticeDialog
        open={activeDialog === 'malpractice'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null)
            setEditingMalpractice(null)
          }
        }}
        initialValue={editingMalpractice}
        onSubmit={saveMalpractice}
        generateId
        allowDocumentUpload={false}
      />
    </div>
  )
}
