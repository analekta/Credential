# Sample Student Data

Here's an example of how to populate the `students.json` file with student records.

## Example students.json

```json
[
  {
    "id": "STU001",
    "name": "John Doe",
    "phone": "+1-555-123-4567",
    "certificateFile": "STU001_certificate.pdf"
  },
  {
    "id": "STU002",
    "name": "Jane Smith",
    "phone": "+1-555-987-6543",
    "certificateFile": "STU002_certificate.pdf"
  },
  {
    "id": "STU003",
    "name": "Bob Johnson",
    "phone": "+1-555-456-7890",
    "certificateFile": "STU003_certificate.pdf"
  },
  {
    "id": "STU004",
    "name": "Alice Brown",
    "phone": "+1-555-789-0123",
    "certificateFile": "STU004_certificate.pdf"
  },
  {
    "id": "STU005",
    "name": "Charlie Wilson",
    "phone": "+1-555-234-5678",
    "certificateFile": "STU005_certificate.pdf"
  }
]
```

## Steps to Add Sample Data

1. Copy the above JSON data
2. Open the `students.json` file in your editor
3. Replace the empty array `[]` with the data above
4. Save the file
5. Make sure the corresponding PDF files exist in the `certificates/` folder:
   - `certificates/STU001_certificate.pdf`
   - `certificates/STU002_certificate.pdf`
   - And so on...

## Phone Number Formats

The system is flexible with phone number formats. All of these are acceptable:

- `+1-555-123-4567`
- `+1 555 123 4567`
- `+15551234567`
- `555-123-4567`
- `(555) 123-4567`

**Important**: Students must enter their phone number in exactly the same format as it's stored in the system.

## Certificate Naming

Certificate files should be named consistently:

Format: `{StudentID}_{description}.pdf`

Examples:
- `STU001_certificate.pdf`
- `STU001_degree.pdf`
- `STU001_completion_certificate.pdf`

The filename must match the `certificateFile` value in the student record.
