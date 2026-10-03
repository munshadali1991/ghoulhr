import { Navigate, useParams } from 'react-router-dom';

/** Deep-link compatibility: /people/:id → /people?person=:id (modal on list). */
export function PeoplePersonRedirect() {
  const { employeeId } = useParams();
  if (!employeeId) {
    return <Navigate to="/people" replace />;
  }
  return <Navigate to={`/people?person=${encodeURIComponent(employeeId)}`} replace />;
}
