"use client";

import { useRef, useState } from 'react';
import { performWorkspaceLogout } from './navigation.mjs';

export function useWorkspaceLogout(logout, beforeLogout) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return {
    pending,
    error,
    signOut: () => performWorkspaceLogout({ logout, beforeLogout, lock, setPending, setError }),
  };
}
