'use client'

import {
  BoardInput,
  DegreeInput,
  HireEmployeePayload,
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
  DegreeFormValue,
} from '@/components/dialogs/degree-dialog'
import { useState } from 'react'
import { ValueOf } from 'next/constants'
import { BoardDialog, BoardFormValue } from '@/components/dialogs/board-dialog'

// import { CredentialDegrees } from '@/modules/hr/credentials/components/cards/credential-degrees'
// import { CredentialBoards } from '@/modules/hr/credentials/components/cards/credential-boards'
// import { CredentialLicenses } from '@/modules/hr/credentials/components/cards/credential-licenses'
// import { CredentialFellowships } from '@/modules/hr/credentials/components/cards/credential-fellowships'
// import { CredentialMemberships } from '@/modules/hr/credentials/components/cards/credential-memberships'
// import { CredentialLifeSupport } from '@/modules/hr/credentials/components/cards/credential-lifesupport'
// import { CredentialMalpractice } from '@/modules/hr/credentials/components/cards/credential-malpractice'

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

  //const degrees = value.credentials?.degrees ?? []
  const degrees = value.credentials?.degrees ?? []
  const boards = value.credentials?.boards ?? []

  function saveDegree(degree: DegreeFormValue) {
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

  function saveBoard(board: BoardFormValue) {
    const exists = boards.some((item: BoardInput) => item.id === board.id)

    const nextBoards = exists
      ? boards.map((item: BoardInput) => (item.id === board.id ? board : item))
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
          if (!open) setActiveDialog(null)
        }}
        initialValue={editingDegree}
        onSubmit={saveDegree}
        generateId={true}
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
        generateId={true}
      />

      {/* <CredentialLicenses licenses={credentials.licenses ?? []} />

      <CredentialFellowships fellowships={credentials.fellowships ?? []} />

      <CredentialMemberships memberships={credentials.memberships ?? []} />

      <CredentialLifeSupport lifeSupports={credentials.lifeSupport ?? []} />

      <CredentialMalpractice malpractice={credentials.malpractice ?? []} /> */}
    </div>
  )
}
