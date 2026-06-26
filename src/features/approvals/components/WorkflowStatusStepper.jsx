import {
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';

const STEP_LABELS = {
  MANAGER: 'Manager approval',
  HR: 'HR approval',
  ADMIN: 'Admin approval',
};

/**
 * @param {{ workflow: import('../types/approvals.types').LeaveApprovalDetail['workflow'] }} props
 */
export function WorkflowStatusStepper({ workflow }) {
  const steps = ['Submitted', 'Pending approval', ...workflow.configuredSteps.map(formatStep)];

  const activeStep = workflow.currentStep === 'PENDING' ? 1 : 2;

  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1 }}>
      {steps.map((label, index) => (
        <Step key={label} completed={index < activeStep}>
          <StepLabel
            optional={
              index === 1 && workflow.currentStep === 'PENDING' ? (
                <Typography variant="caption">{workflow.assignedApproverName}</Typography>
              ) : undefined
            }
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

/**
 * @param {string} step
 */
function formatStep(step) {
  return STEP_LABELS[step] ?? step;
}
