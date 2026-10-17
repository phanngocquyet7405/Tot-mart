"use client";
import { useEffect, useState } from 'react';
import { listManagerResource } from '../services/managerApi';
import { managerError } from './productModel.mjs';
export function useManagerList(kind, filters = {}) {
  const [page,setPage] = useState(1);
  const [version,setVersion] = useState(0);
  const [result,setResult] = useState({key:'',rows:[],pages:1,total:null,error:''});
  const filterKey = JSON.stringify(filters);
  const key = `${kind}:${page}:${version}:${filterKey}`;
  useEffect(()=>{
    const controller=new AbortController();
    listManagerResource(kind,{...JSON.parse(filterKey),page,signal:controller.signal}).then(response=>{
      if(controller.signal.aborted)return;
      if(!Array.isArray(response.data)||response.success===false)throw new Error('Dữ liệu trả về không đúng định dạng.');
      const pages=Math.max(1,Number(response.pagination?.totalPages)||1);
      if(page>pages){setPage(pages);return;}
      setResult({key,rows:response.data,pages,total:response.pagination?.total ?? null,meta:response.meta,error:''});
    }).catch(error=>{if(!controller.signal.aborted)setResult({key,rows:[],pages:1,total:null,error:managerError(error)});});
    return()=>controller.abort();
  },[kind,page,key,filterKey]);
  return {...result,page,setPage,loading:result.key!==key,reload:()=>setVersion(value=>value+1)};
}
