import EmployeesPage from '@/modules/hr/employees/components/employee-page'

const Employees = () => {
  return (
    <div>
      <EmployeesPage />
      {/* LEFT */}
      <div className='left'>{/* Create button */}</div>

      {/* CENTER */}
      <div className='center'>
        {/* User can search employee, if the checkbox in  */}
      </div>

      {/* RIGHT */}
      <div className='right'>
        {/* 
        Text Shows: 1-10 of 180 or 2-10 of 180 or 3-10 of 180 depending on Prev or Next button, by default 1-10 of 180 as it start with the first data. 
        Besides the text is the button Prev and Next button but when Tree or Hierarchy is clicked this will be hide
      */}
        {/* On the most right DIFFERENT BUTTONS/LINKS such as Kanban/List/Tree/Hierarchy */}
      </div>

      {/* This is where it will shows pages or content of Tree/Kanban/List/Hierarchy Views */}
      {/* If the user click List button then the Employee List will be shown/rendered on content */}
      {/* If the user click Kanban button then the Employee List will be shown/rendered on content */}
      {/* If the user click Hierarchy button then the Employee List will be shown/rendered on content */}
      {/* The list view has head of Checkbox, Name (Fullname), Position Item, Department, Job Title, Manager, View(What are the columns to be shown example Manager can be hide/unhide, Department can be hide/unhide, Job Title can be hide/unhide, etc.)*/}
      {/* If the user, click the checkbox, all list the range will be selected and center div will show print or actions (one of the action is Delete, Export, Edit, Send Message) */}
      {/* If the user, click the individual checkbox, center div will show print or export or actions (one of the action is Delete, Edit, Send Message) */}
      {/* If the user, click Create button then the Employee Form will be shown/rendered on content */}
      {/* If the user, click Edit button then the Employee Form with data will be shown/rendered on content */}
      <div className='content'></div>
    </div>
  )
}

export default Employees
