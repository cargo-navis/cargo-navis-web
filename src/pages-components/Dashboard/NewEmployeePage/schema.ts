import { PositionEnum } from '@/lib/api/employees.d';
import { type Schema, array, object, string, boolean } from 'yup';

export const employeeSchema = object({
	firstName: string().required('First name is required'),
	lastName: string().required('Last name is required'),
	position: string<PositionEnum>().required('Position is required'),
	email: string().email('Email must be valid').required('Email is required'),
	phoneNumber: string(),
	governmentId: requiredWhenDriver(string()),
	driverLicenceCategories: requiredWhenDriver(array(string())),
	adr: requiredWhenDriver(boolean()),
	driverLicenceExpiryDate: requiredWhenDriver(string()),
	nationality: requiredWhenDriver(string()),
	contractExpiryDate: requiredWhenDriver(string()),
	medicalExaminationExpiryDate: requiredWhenDriver(string()),
	visaExpiryDate: requiredWhenDriver(string()),
}).required();

function requiredWhenDriver(schema: Schema) {
	return schema.when('position', {
		is: PositionEnum.Driver,
		then: (s) => s.optional(),
	});
}
