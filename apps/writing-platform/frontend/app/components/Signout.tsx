'use client'
import React from "react";
import { signOut } from 'next-auth/react';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import IconButton from '@mui/joy/IconButton';

export default function SignOut() {
  return (

          <IconButton size="sm" variant="plain" color="neutral" onClick={() => signOut() }>
          <LogoutRoundedIcon />
        </IconButton>

);
}