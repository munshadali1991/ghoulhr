import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
  ["@/shared/components/settings/", "@/features/settings/shell/components/"],
  ["from '../constants/settingsNav'", "from '@/features/settings/shell/settingsNav'"],
  ["from '@/constants/settingsNav'", "from '@/features/settings/shell/settingsNav'"],
  ["from '../constants/organizationSettings'", "from '@/features/settings/shell/organizationSettings'"],
  ["from '../hooks/useOrganizationSettingsForm'", "from '@/features/settings/organization/hooks/useOrganizationSettingsForm'"],
  ["from '@/hooks/useOrganizationSettingsForm'", "from '@/features/settings/organization/hooks/useOrganizationSettingsForm'"],
  ["from '../features/organization-settings'", "from '@/features/settings/organization'"],
  ["from '../features/employee-settings'", "from '@/features/settings/employees'"],
  ["from '../features/org-structure'", "from '@/features/settings/org-structure'"],
  ["from '../features/attendance-settings'", "from '@/features/settings/attendance'"],
  ["from '../features/location-settings'", "from '@/features/settings/locations'"],
  ["from '../features/leave-settings'", "from '@/features/settings/leave'"],
  ["from '@/features/organization-settings'", "from '@/features/settings/organization'"],
  ["from '@/features/employee-settings'", "from '@/features/settings/employees'"],
  ["from '@/features/org-structure'", "from '@/features/settings/org-structure'"],
  ["from '@/features/attendance-settings'", "from '@/features/settings/attendance'"],
  ["from '@/features/location-settings'", "from '@/features/settings/locations'"],
  ["from '@/features/leave-settings'", "from '@/features/settings/leave'"],
  ["from '../../org-structure/", "from '@/features/settings/org-structure/"],
  ["from '../../../hooks/useEmployeeSettings'", "from '@/features/settings/employees/hooks/useEmployeeSettings'"],
  ["from '@/hooks/useEmployeeSettings'", "from '@/features/settings/employees/hooks/useEmployeeSettings'"],
  ["from '../../../hooks/useLeaveConfigurations'", "from '@/features/settings/leave/hooks/useLeaveConfigurations'"],
  ["from '../../../hooks/useLocationConfigurations'", "from '@/features/settings/locations/hooks/useLocationConfigurations'"],
  ["from '../../../hooks/useAttendanceSettings'", "from '@/features/settings/attendance/hooks/useAttendanceSettings'"],
  ["from '../services/settingsApi'", "from '@/features/settings/api/settingsApi'"],
  ["from '../../services/settingsApi'", "from '@/features/settings/api/settingsApi'"],
  ["from '../utils/settingsMapper'", "from '@/features/settings/shell/settingsMapper'"],
  ["features/attendance-settings/checkin", "features/settings/attendance/submodules/check-in"],
  ["features/attendance-settings/schedule", "features/settings/attendance/submodules/schedule"],
  ["features/attendance-settings/shifts", "features/settings/attendance/submodules/shifts"],
  ["from '../components/IpAddressInput'", "from '@/features/settings/attendance/components/IpAddressInput'"],
  ["from '../components/SettingsOverviewCard'", "from '@/features/settings/attendance/components/SettingsOverviewCard'"],
  ["from '@/utils/shiftTime'", "from '@/features/settings/attendance/utils/shiftTime'"],
  ["from '../../../utils/shiftTime'", "from '@/features/settings/attendance/utils/shiftTime'"],
  ["from '@/pages/SettingsPage'", "from '@/features/settings'"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(js|jsx)$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [from, to] of replacements) {
        if (content.includes(from)) {
          content = content.split(from).join(to);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(full, content);
    }
  }
}

walk(srcDir);
console.log('Settings imports updated');
