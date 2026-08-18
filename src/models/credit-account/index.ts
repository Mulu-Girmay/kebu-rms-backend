import { model } from 'mongoose';

import creditAccountSchema from './schema.js';
import { creditAccountMethods } from './methods.js';

creditAccountSchema.method(creditAccountMethods);


const CreditAccount = model('CreditAccount', creditAccountSchema);

export default CreditAccount;