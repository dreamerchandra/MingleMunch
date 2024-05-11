import { Tooltip as MuiTooltip } from '@mui/material';
import ActivityCalendar, {
    Activity,
    ThemeInput
} from 'react-activity-calendar';

const explicitTheme: ThemeInput = {
  light: ['#f0f0f0', '#c4edde', '#7ac7c4', '#f73859', '#384259'],
  dark: ['#e9e9e9', '#4D455D', '#7DB9B6', '#F5E9CF', '#E96479']
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
        <MuiTooltip title={`${activity.count} activities on ${activity.date}`}>
          {block}
        </MuiTooltip>
      )}
    />
  );
};
