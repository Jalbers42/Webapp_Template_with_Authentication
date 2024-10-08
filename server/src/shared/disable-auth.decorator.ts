import { SetMetadata } from '@nestjs/common';

// Define a custom metadata key for routes where authentication is disabled
export const DISABLE_AUTH_KEY = 'disableAuth';
export const DisableAuth = () => SetMetadata(DISABLE_AUTH_KEY , true);
