'use client';
import { lusitana } from '@/app/ui/fonts';
import {
  ExclamationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { LoginButton } from './LoginButton';
import { useActionState, useState, useRef } from 'react';
import { authenticate } from '../lib/actions';
import Sheet from '@mui/joy/Sheet';

// Define users with their names and emails
const USERS = [
  { name: 'John', email: 'john@nextmail.com', password: 'john123' },
  { name: 'Jill', email: 'jill@nextmail.com', password: 'jill123' },
  { name: 'James Bond', email: 'jamesbond@nextmail.com', password: 'james123' },
  { name: 'Loki', email: 'loki@nextmail.com', password: 'loki123' },
  { name: 'Terminator', email: 'terminator@nextmail.com', password: 'terminator123' }
];

export default function LoginForm() {
  const formRef = useRef<HTMLFormElement>(null);
  
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  // State to manage selected user
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Find the selected user's details
  const selectedUserDetails = USERS.find(user => user.name === selectedUser);

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 2,
        borderRadius: 'sm',
        boxShadow: 'md'
      }}
    >
      <form 
        ref={formRef} 
        action={formAction} 
        className="space-y-3"
      >
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`} style={{color: "black"}}>
            Please log in to continue.
          </h1>
          <div className="w-full">
            {/* User Selection Dropdown */}
            <div className="mb-4">
              <label 
                htmlFor="user-select" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select User
              </label>
              <div className="relative">
                <select
                  id="user-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                  className="
                    appearance-none 
                    w-full 
                    px-3 
                    py-2 
                    border 
                    border-gray-300 
                    rounded-md 
                    shadow-sm 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-blue-500
                    text-sm
                  "
                >
                  <option value="" disabled>
                    Choose a user
                  </option>
                  {USERS.map((user) => (
                    <option 
                      key={user.name} 
                      value={user.name}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
                <div 
                  className="
                    pointer-events-none 
                    absolute 
                    inset-y-0 
                    right-0 
                    flex 
                    items-center 
                    px-2 
                    text-gray-500
                  "
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Hidden inputs for email and password */}
            <input
              type="hidden"
              name="email"
              value={selectedUserDetails?.email || ''}
            />
            <input
              type="hidden"
              name="password"
              value={selectedUserDetails?.password || ''}
            />
          </div>
          <LoginButton
            className="mt-4 w-full"
            aria-disabled={isPending || !selectedUser}
          >
            Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
          </LoginButton>
          <div className="flex h-8 items-end space-x-1">
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </Sheet>
  );
}