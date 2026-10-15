"use client";
import PackagesWorkspace from '../components/PackagesWorkspace';
import { useManagerDraft } from '../components/ManagerLayout';
export default function Page(){return <PackagesWorkspace kind="subscriptions" onDirtyChange={useManagerDraft()} />;}
