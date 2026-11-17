"use client";
import ProductsWorkspace from '../components/ProductsWorkspace';
import { useManagerDraft } from '../components/ManagerLayout';
export default function Page(){return <ProductsWorkspace onDirtyChange={useManagerDraft()} />;}
