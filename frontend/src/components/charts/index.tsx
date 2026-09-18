'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { useTranslation } from '@/components/providers/i18n-provider';

export interface AttendanceStatItem {
  name: string;
  present: number;
  absent: number;
  late: number;
}

export interface EnrollmentStatItem {
  month: string;
  students: number;
  teachers: number;
}

export function AttendanceChart({ data, title }: { data: AttendanceStatItem[]; title: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.75rem', color: '#111827' }} />
          <Bar dataKey="present" fill="#10B981" name={t('crud.present')} radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent" fill="#EF4444" name={t('crud.absent')} radius={[4, 4, 0, 0]} />
          <Bar dataKey="late" fill="#F59E0B" name={t('crud.late')} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export interface PaymentStatItem {
  name: string;
  value: number;
}

export function PaymentChart({ data, title }: { data: PaymentStatItem[]; title: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={100} fill="#8884d8" dataKey="value">
            {data.map((_item: PaymentStatItem, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.75rem', color: '#111827' }} />
          <Legend wrapperStyle={{ color: '#6B7280' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnrollmentChart({ data, title }: { data: EnrollmentStatItem[]; title: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.75rem', color: '#111827' }} />
          <Legend wrapperStyle={{ color: '#6B7280' }} />
          <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} name={t('crud.student')} />
          <Line type="monotone" dataKey="teachers" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name={t('crud.teacher')} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
