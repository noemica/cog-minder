import {
    ColumnDef,
    HeaderGroup,
    OnChangeFn,
    Row,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import "./Table.less";

export function TableRow<T>({ row }: { row: Row<T> }) {
    return (
        <tr>
            {row.getVisibleCells().map((cell) => {
                return (
                    <td className="table-cell" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                );
            })}
        </tr>
    );
}

export function TableHeaderGroup<T>({ headerGroup }: { headerGroup: HeaderGroup<T> }) {
    return (
        <tr>
            {headerGroup.headers.map((header) => {
                let className: string;
                const isSorted = header.column.getIsSorted();
                let size: number | undefined;

                if (header.subHeaders.length > 0) {
                    className = "table-column-group";
                } else {
                    if (isSorted === "asc") {
                        className = "table-column-ascending";
                    } else if (isSorted === "desc") {
                        className = "table-column-descending";
                    } else {
                        className = "table-column-unsorted";
                    }

                    size = header.getSize();
                    if (size === 150) {
                        size = undefined;
                        // Default size is intended as 150 pixels but don't really
                        // want to size everything individually
                    }
                }

                return (
                    <th
                        style={{
                            minWidth: size ? size + "rem" : undefined,
                        }}
                        key={header.id}
                        colSpan={header.colSpan}
                    >
                        <div className={className} onClick={header.column.getToggleSortingHandler()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                    </th>
                );
            })}
        </tr>
    );
}

export type TableProps<T> = {
    columns: ColumnDef<T, any>[];
    data: T[];
    sorting: SortingState;
    setSorting: OnChangeFn<SortingState>;
};

export default function Table<T>({ columns, data, sorting, setSorting }: TableProps<T>) {
    const table = useReactTable<T>({
        data: data,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <div className="table-container">
            <table cellSpacing={0} cellPadding={0}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup} />
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} row={row} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
