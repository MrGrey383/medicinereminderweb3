import { useState } from 'react';

/**
 * Custom hook for form handling
 * @param {object} initialValues - Initial form values
 * @param {function} onSubmit - Submit callback
 * @param {function} validate - Validation function
 * @returns {object} Form state and methods
 */
export const useForm = (initialValues, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues({
      ...values,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleBlur = (name) => {
    setTouched({
      ...touched,
      [name]: true
    });

    // Validate on blur if validation function provided
    if (validate) {
      const fieldErrors = validate({ ...values });
      if (fieldErrors[name]) {
        setErrors({
          ...errors,
          [name]: fieldErrors[name]
        });
      }
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();

    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const setFieldValue = (name, value) => {
    setValues({
      ...values,
      [name]: value
    });
  };

  const setFieldError = (name, error) => {
    setErrors({
      ...errors,
      [name]: error
    });
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError
  };
};

export default useForm;