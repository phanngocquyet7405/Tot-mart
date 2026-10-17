"use client";
import OrdersWorkspace from '../components/OrdersWorkspace';
import { useManagerDraft } from '../components/ManagerLayout';
export default function Page(){return <OrdersWorkspace onDirtyChange={useManagerDraft()} />;}
