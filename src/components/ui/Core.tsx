import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  return <span className={clsx('badge', `badge-${variant}`, className)}>{children}</span>;
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'report_ready':
      case 'paid':
        return { bg: 'var(--success-50)', text: 'var(--success-600)', dot: 'var(--success-500)' };
      case 'checked_in':
      case 'waiting':
      case 'in_consultation':
      case 'processing':
      case 'sample_collected':
        return { bg: 'var(--primary-50)', text: 'var(--primary-700)', dot: 'var(--primary-500)' };
      case 'booked':
      case 'confirmed':
      case 'pending':
        return { bg: 'var(--warning-50)', text: 'var(--warning-600)', dot: 'var(--warning-500)' };
      case 'cancelled':
      case 'rejected':
      case 'no_show':
        return { bg: 'var(--danger-50)', text: 'var(--danger-600)', dot: 'var(--danger-500)' };
      default:
        return { bg: 'var(--slate-100)', text: 'var(--slate-600)', dot: 'var(--slate-400)' };
    }
  };

  const style = getStyle();
  const formatLabel = (str: string) =>
    str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className="status-pill"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="status-dot" style={{ backgroundColor: style.dot }} />
      {formatLabel(status)}
    </span>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '600px',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="card-title">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted"
            style={{ fontSize: '1.5rem', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
