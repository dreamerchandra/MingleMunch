import { Tooltip as MuiTooltip } from '@mui/material';
import ActivityCalendar, {
    Activity,
    ThemeInput
} from 'react-activity-calendar';

const explicitTheme: ThemeInput = {
  light: ['#e9e9e9', '#d9c6ff', '#b28cff', '#915aff', '#5500ff'],
  dark: ['#e9e9e9', '#d9c6ff', '#b28cff', '#915aff', '#5500ff']
};

export const ActivityCalender = ({ data }: { data: Array<Activity> }) => {
  return (
    <ActivityCalendar
      theme={explicitTheme}
      blockRadius={40}
      style={{
        border: '1px solid #f0f0f0'
      }}
      data={data}
      labels={{
        legend: {
          less: 'Less',
          more: 'More'
        },
        months: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ],
        totalCount: '{{count}} contributions in {{year}}',
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }}
      hideColorLegend={false}
      hideMonthLabels={false}
      hideTotalCount={false}
      showWeekdayLabels
      renderBlock={(block, activity) => (
        <MuiTooltip title={`Rs. ${activity.count} spent on ${activity.date}`}>
          {block}
        </MuiTooltip>
      )}
    />
  );
};
