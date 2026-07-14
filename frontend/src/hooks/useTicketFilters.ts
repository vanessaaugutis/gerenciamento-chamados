import { useState } from 'react';

export function useTicketFilters() {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterRequester, setFilterRequester] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const resetFilters = () => {
    setFilterSubject('');
    setFilterRequester('');
    setFilterCategoryId('');
    setFilterPriority('');
    setFilterStatus('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPageSize(5);
  };

  return {
    filterSubject,
    setFilterSubject,
    filterRequester,
    setFilterRequester,
    filterCategoryId,
    setFilterCategoryId,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filtersOpen,
    setFiltersOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  };
}
