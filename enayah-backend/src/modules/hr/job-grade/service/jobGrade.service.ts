import { AppError } from '../../../../core/errors/AppError'
import {
  toJobGradeDB,
  toJobGradeResponse,
  toJobGradeUpdateDB,
} from '../dto/jobGrade.mapper'
import { CreateJobGradeDTO, UpdateJobGradeDTO } from '../dto/jobGrade.request'
import { JobGradeResponseDTO } from '../dto/jobGrade.response'
import { JobGradeRepository } from '../repository/jobGrade.repository'

export const JobGradeService = {
  create: async (data: CreateJobGradeDTO) => {
    // Implement the logic to create a job grade
    // For example, you can use a database model to save the job grade
    // const newJobGrade = await JobGradeModel.create(data);
    // return newJobGrade;
    if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
      throw new AppError(
        'Minimum salary cannot be greater than maximum salary',
        400,
      )
    }

    const [grade] = await JobGradeRepository.create(toJobGradeDB(data))
    return toJobGradeResponse(grade)
  },

  findAll: async () => {
    // Implement the logic to retrieve all job grades
    // For example, you can use a database model to fetch all job grades
    // const jobGrades = await JobGradeModel.find();
    // return jobGrades;
    const jobGrades = await JobGradeRepository.findAll()
    return jobGrades.map(toJobGradeResponse)
  },

  findById: async (id: string) => {
    // Implement the logic to retrieve a job grade by its ID
    // For example, you can use a database model to fetch a job grade by ID
    // const jobGrade = await JobGradeModel.findById(id);
    // return jobGrade;
    const jobGrade = await JobGradeRepository.findById(id)
    if (!jobGrade) {
      throw new AppError('Job grade not found', 404)
    }
    return toJobGradeResponse(jobGrade)
  },

  update: async (id: string, data: UpdateJobGradeDTO) => {
    // Implement the logic to update a job grade by its ID
    // For example, you can use a database model to update a job grade by ID
    // const updatedJobGrade = await JobGradeModel.findByIdAndUpdate(id, data, { new: true });
    // return updatedJobGrade;
    const jobGrade = await JobGradeRepository.findById(id)
    if (!jobGrade) {
      throw new AppError('Job grade not found', 404)
    }

    if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
      throw new AppError(
        'Minimum salary cannot be greater than maximum salary',
        400,
      )
    }

    const [updatedJobGrade] = await JobGradeRepository.update(
      id,
      toJobGradeUpdateDB(data),
    )
    return toJobGradeResponse(updatedJobGrade)
  },

  delete: async (id: string, userId: string) => {
    // Implement the logic to delete a job grade by its ID
    // For example, you can use a database model to delete a job grade by ID
    // await JobGradeModel.findByIdAndDelete(id);
    const jobGrade = await JobGradeRepository.findById(id)
    if (!jobGrade) {
      throw new AppError('Job grade not found', 404)
    }

    await JobGradeRepository.softDelete(id, userId)
  },
}

//export default JobGradeService
