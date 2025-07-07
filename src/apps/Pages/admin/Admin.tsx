import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

import type {
 
  ColumnDef,
} from '@tanstack/react-table';
import axios from 'axios';
import dayjs from 'dayjs';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/theme-provider';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at?: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const { theme } = useTheme();

  const isDarkMode =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'username',
        header: 'Username',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'password',
        header: 'Password Hash',
        cell: info => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(info.getValue()).substring(0, 8)}...
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: info =>
          info.getValue()
            ? dayjs(info.getValue() as string).format('DD MMM YYYY, hh:mm A')
            : 'N/A',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icons.moreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Icons.edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Icons.trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="text-center p-6 max-w-md">
          <Icons.alertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Icons.refresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Icons.shield className="h-6 w-6 text-primary" />
              User Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative max-w-md">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                />
              </div>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            {loading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <Icons.chevronUp className="ml-1 h-4 w-4" />,
                              desc: <Icons.chevronDown className="ml-1 h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <Icons.chevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-accent/50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Icons.chevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <Button
              key={i}
              variant={i === table.getState().pagination.pageIndex ? 'default' : 'outline'}
              size="sm"
              onClick={() => table.setPageIndex(i)}
              className={i === table.getState().pagination.pageIndex ? 'font-bold' : ''}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Icons.chevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
