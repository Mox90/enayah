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
import { DegreeInput } from '@/modules/hr/onboarding/types/onboarding.types'
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

  const createDegreeMutation = useCreateDegree(employeeId)
  const updateDegreeMutation = useUpdateDegree(employeeId)
  const deleteDegreeMutation = useDeleteDegree(employeeId)

  const createBoardMutation = useCreateBoard(employeeId)
  const updateBoardMutation = useUpdateBoard(employeeId)
  const deleteBoardMutation = useDeleteBoard(employeeId)

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

      <CredentialLicenses licenses={data?.licenses ?? []} />

      <CredentialFellowships fellowships={data?.fellowships ?? []} />

      <CredentialMemberships memberships={data?.memberships ?? []} />

      <CredentialLifeSupport lifeSupports={data?.lifeSupport ?? []} />

      <CredentialMalpractice malpractice={data?.malpractice ?? []} />
    </div>
  )
}

export default CredentialsTab
