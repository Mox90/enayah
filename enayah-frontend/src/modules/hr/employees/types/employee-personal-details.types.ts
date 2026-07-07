export type Identification = {
  id: string
  type: 'national_id' | 'iqama' | 'gcc_id' | 'passport' | 'other'
  identificationNumber: string
  issueDate: string
  expiryDate: string
  sponsor?: string | null
  issuingAuthority?: string | null
  occupation?: string | null
  isCurrent: boolean
  fileId?: string | null
}

export type Dependent = {
  id: string
  firstNameEn: string
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn: string
  firstNameAr: string
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr: string
  relationship: 'spouse' | 'child' | 'father' | 'mother' | 'other'
  gender: 'male' | 'female'
  dateOfBirth?: string | null
}

export type Address = {
  id: string
  addressType: 'home' | 'mailing'
  countryId: string
  city: string
  district: string
  street: string
  building?: string | null
  postalCode: string
  additionalNumber?: string | null
  country: {
    id: string
    name: string
    nameAr: string
  }
}

export type EmergencyContact = {
  id: string
  name: string
  relationship: 'spouse' | 'child' | 'father' | 'mother' | 'other'
  mobile: string | null
  alternateMobile?: string | null
  address?: string | null
}

export type Visa = {
  id: string
  visaNumber: string
  visaType?: string
  issueDate?: string | null
  expiryDate?: string | null
  isCurrent: boolean
  fileId?: string | null
}

export type Email = {
  id: string
  type: 'work' | 'personal' | 'secondary' | 'other'
  email: string
  isPrimary: boolean
}

export type PhoneNumber = {
  id: string
  type: 'mobile' | 'work' | 'home' | 'fax' | 'other'
  countryCode: string
  phoneNumber: string
  extension?: string | null
  isPrimary: boolean
  isWhatsapp: boolean
}

export interface EmployeePersonalDetails {
  employeeId: string
  identifications: Identification[]
  emails: Email[]
  phoneNumbers: PhoneNumber[]
  dependents: Dependent[]
  addresses: Address[]
  emergencyContacts: EmergencyContact[]
  visas: Visa[]
}
