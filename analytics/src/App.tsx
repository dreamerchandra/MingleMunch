import {
  DataGrid,
  GridColDef,
  GridColumnGroupingModel,
  GridRowId
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { ActivityCalender } from './activity-calender';
import { DateRangePicker } from 'rsuite';
import { Shop } from './query/use-hotel';
import { Order, useOrderQuery } from './query/use-order';
import { ShopSelect } from './shop/shop-select';
import { Activity } from 'react-activity-calendar';

type OrderRow = {
  id: string;
  name: string;
  firstOrder: Date;
  lastOrder: Date;
  totalOrderCount: number;
  dateRangeOrderCount: number;
  orderedHotel: Shop[];
  drOrderHotel: Shop[];
  gmv: number;
  drGmv: number;
  delivery: number;
  drDelivery: number;
  revenue: number;
  drRevenue: number;
  history: Map<
    string,
    {
      date: Date;
      revenue: number;
      orderId: string[];
    }
  >;
  minRevenue: number;
  maxRevenue: number;
};

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 130 },
  {
    field: 'firstOrder',
    headerName: 'First Order',
    width: 130,
    type: 'date'
  },
  {
    field: 'lastOrder',
    headerName: 'Last Order',
    width: 130,
    type: 'date'
  },
  {
    field: 'totalOrderCount',
    headerName: 'Total Order Count',
    width: 130,
    type: 'number'
  },
  {
    field: 'orderedHotel',
    headerName: 'Ordered Hotel',
    width: 130,
    type: 'singleSelect'
  },
  { field: 'gmv', headerName: 'GMV', width: 130, type: 'number' },
  { field: 'delivery', headerName: 'Delivery', width: 130, type: 'number' },
  { field: 'revenue', headerName: 'Revenue', width: 130, type: 'number' },

  {
    field: 'dateRangeOrderCount',
    headerName: 'Order Count',
    width: 130,
    type: 'number'
  },

  {
    field: 'drOrderHotel',
    headerName: 'Ordered Hotel',
    width: 130,
    type: 'singleSelect'
  },
  { field: 'drGmv', headerName: 'GMV', width: 130, type: 'number' },
  { field: 'drDelivery', headerName: 'Delivery', width: 130, type: 'number' },
  { field: 'drRevenue', headerName: 'Revenue', width: 130, type: 'number' }
];

const columnGroup: GridColumnGroupingModel = [
  {
    groupId: 'Filtered',
    children: [
      {
        field: 'dateRangeOrderCount'
      },
      {
        field: 'drOrderHotel'
      },
      {
        field: 'drGmv'
      },
      {
        field: 'drDelivery'
      },
      {
        field: 'drRevenue'
      }
    ]
  },
  {
    groupId: 'Life Time',
    children: [
      {
        field: 'totalOrderCount'
      },
      {
        field: 'orderedHotel'
      },
      {
        field: 'gmv'
      },
      {
        field: 'delivery'
      },
      {
        field: 'revenue'
      }
    ]
  }
];

type DateRange = {
  from: Date;
  to: Date;
} | null;

const useCreateRow = ({
  orders,
  dateRange,
  selectShop
}: {
  dateRange: DateRange;
  orders?: Order[];
  selectShop: string[];
}) => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  useEffect(() => {
    if (!orders) {
      return;
    }
    const result: Record<string, OrderRow> = {};
    console.log('recomute');
    for (const order of orders) {
      const isWithinRange = dateRange
        ? order.createdAt.toDate() >= dateRange.from &&
          order.createdAt.toDate() <= dateRange.to
        : true;
      const byShop = Object.keys(order.shopOrderValue).reduce(
        (acc, s) => {
          if (selectShop.length === 0 ? false : !selectShop.includes(s)) {
            return acc;
          }
          acc[s] = {
            deliveryCharges: order.shopOrderValue[s]?.deliveryCharges ?? 0,
            displaySubTotal: order.shopOrderValue[s]?.displaySubTotal ?? 0,
            costPriceSubTotal: order.shopOrderValue[s]?.costPriceSubTotal ?? 0,
            parcelChargesTotal:
              order.shopOrderValue[s]?.parcelChargesTotal ?? 0,
            costPriceParcelChargesTotal:
              order.shopOrderValue[s]?.costPriceParcelChargesTotal ?? 0
          };
          return acc;
        },
        {} as Record<
          string,
          {
            deliveryCharges: number;
            displaySubTotal: number;
            costPriceSubTotal: number;
            parcelChargesTotal: number;
            costPriceParcelChargesTotal: number;
          }
        >
      );
      if (Object.keys(byShop).length === 0) {
        continue;
      }
      const deliveryCharges = Object.values(byShop).reduce((acc, v) => {
        return acc + v.deliveryCharges;
      }, 0);
      const gmv =
        Object.values(byShop).reduce((acc, v) => {
          return acc + v.displaySubTotal + v.parcelChargesTotal;
        }, 0) - order.bill.discountFee;
      const costPriceSubTotal = Object.values(byShop).reduce((acc, v) => {
        return acc + v.costPriceSubTotal + v.costPriceParcelChargesTotal;
      }, 0);
      const revenue = gmv - costPriceSubTotal;

      if (!result[order.userId]) {
        const history = new Map();
        history.set(order.createdAt.toDate().toDateString(), {
          date: order.createdAt.toDate(),
          orderId: [order.orderId],
          revenue
        });
        result[order.userId] = {
          id: order.userId,
          name: order.user.name ?? '',
          firstOrder: order.createdAt.toDate(),
          lastOrder: order.createdAt.toDate(),
          totalOrderCount: 1,
          dateRangeOrderCount: isWithinRange ? 1 : 0,
          orderedHotel: order.shops,
          drOrderHotel: isWithinRange ? order.shops : [],
          gmv: gmv,
          drGmv: isWithinRange ? gmv : 0,
          delivery: deliveryCharges,
          drDelivery: isWithinRange ? deliveryCharges : 0,
          revenue: revenue,
          drRevenue: isWithinRange ? revenue : 0,
          history,
          minRevenue: revenue,
          maxRevenue: revenue
        };
        continue;
      }
      const shops = result[order.userId].orderedHotel
        .concat(order.shops)
        .filter((v, i, a) => a.indexOf(v) === i);
      const minRevenue = Math.min(result[order.userId].minRevenue, revenue);
      const maxRevenue = Math.max(result[order.userId].maxRevenue, revenue);
      const oldHistory = result[order.userId].history.get(
        order.createdAt.toDate().toDateString()
      );
      if (oldHistory) {
        oldHistory.revenue += revenue;
        oldHistory.orderId.push(order.orderId);
      } else {
        result[order.userId].history.set(
          order.createdAt.toDate().toDateString(),
          {
            date: order.createdAt.toDate(),
            orderId: [order.orderId],
            revenue
          }
        );
      }

      result[order.userId] = {
        ...result[order.userId],
        lastOrder: order.createdAt.toDate(),
        totalOrderCount: result[order.userId].totalOrderCount + 1,
        dateRangeOrderCount: isWithinRange
          ? result[order.userId].dateRangeOrderCount + 1
          : result[order.userId].dateRangeOrderCount,
        orderedHotel: shops,
        drOrderHotel: isWithinRange ? shops : result[order.userId].drOrderHotel,
        gmv: result[order.userId].gmv + gmv,
        drGmv: isWithinRange
          ? result[order.userId].drGmv + gmv
          : result[order.userId].drGmv,
        delivery: result[order.userId].delivery + deliveryCharges,
        drDelivery: isWithinRange
          ? result[order.userId].drDelivery + deliveryCharges
          : result[order.userId].drDelivery,
        revenue: revenue,
        drRevenue: isWithinRange ? revenue : result[order.userId].drRevenue,
        minRevenue,
        maxRevenue
      };
    }
    setRows(Object.values(result));
  }, [orders, dateRange, selectShop]);
  return rows;
};

const useCreateActivity = ({ row, selectedRow }: { row: OrderRow[], selectedRow: GridRowId[] }): Activity[] => {
  const [result, setResult] = useState<Activity[]>([]);
  useEffect(() => {
    const result: Activity[] = [];
    const maxRevenue = Math.max(...row.map((r) => r.maxRevenue));
    const minRevenue = Math.max(...row.map((r) => r.minRevenue));
    const maxLevel = 4;
    const rows = row.filter((r) => selectedRow.includes(r.id));
    const history = rows.flatMap((r) => Array.from(r.history.values()));
    for (const record of history) {
      const month =
        record.date.getMonth() + 1 > 9
          ? record.date.getMonth() + 1
          : `0${record.date.getMonth() + 1}`;
      const day =
        record.date.getDate() > 9
          ? record.date.getDate()
          : `0${record.date.getDate()}`;
      const date = `${record.date.getFullYear()}-${month}-${day}`;
      // const data = sampleData.find((s) => s.date === date)!;
      // data.count = record.revenue;
      // data.level = level;
      const level = Math.max(
        Math.floor(
          ((record.revenue - minRevenue) / (maxRevenue - minRevenue)) * maxLevel
        ),
        0
      );
      result.push({
        date,
        count: record.revenue,
        level
      });
      console.log(record);
      setResult(result);
    }
  }, [row, selectedRow]);

  return result;
};

export function App() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const { data: orders } = useOrderQuery();
  const [selectShop, setSelected] = useState<Array<string>>([]);
  const [selectedRow, setSelectedRow] = useState<GridRowId[]>([]);
  const rows = useCreateRow({ orders, dateRange, selectShop });
  const activity = useCreateActivity({
    row: rows,
    selectedRow,
  });

  return (
    <div>
      <ShopSelect selectShop={selectShop} setSelected={setSelected} />
      <DateRangePicker
        value={dateRange ? [dateRange.from, dateRange.to] : null}
        onChange={(e) => {
          if (e == null) {
            setDateRange(null);
            return;
          }
          setDateRange({ from: e[0], to: e[1] });
        }}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 }
          }
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        columnGroupingModel={columnGroup}
        onRowSelectionModelChange={(e) => {
          setSelectedRow(e);
        }}
        rowSelectionModel={selectedRow}
      />
      <ActivityCalender data={activity} />
    </div>
  );
}
