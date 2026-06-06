import { DIFFERENTIAL_CARD_IDS, PARAMETERS_ALL } from "./biometry";

export type ValidationDataFileName =
  | "case_log.csv"
  | "measurement_rows.csv"
  | "diagnostic_labels.csv"
  | "reader_study_rows.csv"
  | "report_audit_rows.csv";

export type ValidationDataRequirement = "yes" | "conditional" | "optional";

export interface ValidationDataColumnSchema {
  name: string;
  required: ValidationDataRequirement;
  allowedValues?: readonly string[];
  numeric?: boolean;
  min?: number;
  exclusiveMin?: number;
  max?: number;
  integer?: boolean;
}

export interface ValidationDataFileSchema {
  fileName: ValidationDataFileName;
  columns: ValidationDataColumnSchema[];
}

export type ValidationDataRow = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ValidationDataExport = Partial<
  Record<ValidationDataFileName, readonly ValidationDataRow[]>
>;

export const VALIDATION_DATA_FILE_ORDER: ValidationDataFileName[] = [
  "case_log.csv",
  "measurement_rows.csv",
  "diagnostic_labels.csv",
  "reader_study_rows.csv",
  "report_audit_rows.csv",
];

const BOOLEAN_VALUES = ["true", "false"] as const;
const COHORT_VALUES = [
  "feta_2024",
  "institutional",
  "reader_study",
  "report_audit",
] as const;
const SVR_METHOD_VALUES = [
  "none",
  "clinical_svr",
  "research_svr",
  "unknown",
] as const;
const SOURCE_ROLE_VALUES = [
  "reference",
  "calculator",
  "reader",
  "ai_prefill",
] as const;
const PARAMETER_ID_VALUES = PARAMETERS_ALL.map(parameter => parameter.id);
const PARAMETER_UNITS_BY_ID = new Map(
  PARAMETERS_ALL.map(parameter => [parameter.id, parameter.unit])
);
const TRIGGER_ID_VALUES = DIFFERENTIAL_CARD_IDS;
const NASA_TLX_COLUMNS = [
  "nasa_tlx_mental_demand",
  "nasa_tlx_physical_demand",
  "nasa_tlx_temporal_demand",
  "nasa_tlx_performance",
  "nasa_tlx_effort",
  "nasa_tlx_frustration",
] as const;
const SUS_COLUMNS = [
  "sus_item_1",
  "sus_item_2",
  "sus_item_3",
  "sus_item_4",
  "sus_item_5",
  "sus_item_6",
  "sus_item_7",
  "sus_item_8",
  "sus_item_9",
  "sus_item_10",
] as const;

export const VALIDATION_DATA_SCHEMAS: Record<
  ValidationDataFileName,
  ValidationDataFileSchema
> = {
  "case_log.csv": {
    fileName: "case_log.csv",
    columns: [
      { name: "study_id", required: "yes" },
      { name: "cohort", required: "yes", allowedValues: COHORT_VALUES },
      { name: "site_id", required: "yes" },
      { name: "scanner_vendor", required: "yes" },
      {
        name: "field_strength_t",
        required: "yes",
        numeric: true,
        exclusiveMin: 0,
      },
      { name: "svr_method", required: "yes", allowedValues: SVR_METHOD_VALUES },
      { name: "image_quality_tier", required: "yes" },
      {
        name: "ga_weeks",
        required: "yes",
        numeric: true,
        min: 18,
        max: 40,
        integer: true,
      },
      {
        name: "ga_days",
        required: "yes",
        numeric: true,
        min: 0,
        max: 6,
        integer: true,
      },
      { name: "included", required: "yes", allowedValues: BOOLEAN_VALUES },
      { name: "exclusion_reason", required: "conditional" },
      {
        name: "reference_standard_available",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "prediction_available",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "pathology_label_available",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
    ],
  },
  "measurement_rows.csv": {
    fileName: "measurement_rows.csv",
    columns: [
      { name: "study_id", required: "yes" },
      {
        name: "parameter_id",
        required: "yes",
        allowedValues: PARAMETER_ID_VALUES,
      },
      {
        name: "source_role",
        required: "yes",
        allowedValues: SOURCE_ROLE_VALUES,
      },
      { name: "reader_id", required: "conditional" },
      {
        name: "value_mm",
        required: "conditional",
        numeric: true,
        exclusiveMin: 0,
      },
      {
        name: "value_deg",
        required: "conditional",
        numeric: true,
        exclusiveMin: 0,
      },
      {
        name: "measurement_available",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
      { name: "missing_reason", required: "conditional" },
      { name: "image_quality_tier", required: "yes" },
      { name: "acquisition_site", required: "optional" },
    ],
  },
  "diagnostic_labels.csv": {
    fileName: "diagnostic_labels.csv",
    columns: [
      { name: "study_id", required: "yes" },
      {
        name: "trigger_id",
        required: "yes",
        allowedValues: TRIGGER_ID_VALUES,
      },
      {
        name: "reference_label",
        required: "conditional",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "predicted_label",
        required: "conditional",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "predicted_probability",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 1,
      },
      { name: "threshold", required: "yes", numeric: true, min: 0, max: 1 },
      { name: "indeterminate", required: "yes", allowedValues: BOOLEAN_VALUES },
      { name: "indeterminate_reason", required: "conditional" },
    ],
  },
  "reader_study_rows.csv": {
    fileName: "reader_study_rows.csv",
    columns: [
      { name: "reader_id", required: "yes" },
      { name: "study_id", required: "yes" },
      {
        name: "condition",
        required: "yes",
        allowedValues: ["without_tool", "with_tool"],
      },
      {
        name: "read_order",
        required: "yes",
        numeric: true,
        min: 1,
        integer: true,
      },
      { name: "washout_days", required: "yes", numeric: true, min: 14 },
      {
        name: "duration_sec",
        required: "yes",
        numeric: true,
        exclusiveMin: 0,
      },
      {
        name: "completeness_score",
        required: "yes",
        numeric: true,
        min: 0,
      },
      {
        name: "zscore_documentation_rate",
        required: "yes",
        numeric: true,
        min: 0,
        max: 1,
      },
      {
        name: "recommendation_congruent",
        required: "conditional",
        allowedValues: BOOLEAN_VALUES,
      },
      { name: "categorical_label", required: "optional" },
      { name: "continuous_measurement", required: "optional", numeric: true },
      {
        name: "nasa_tlx_mental_demand",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "nasa_tlx_physical_demand",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "nasa_tlx_temporal_demand",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "nasa_tlx_performance",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "nasa_tlx_effort",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "nasa_tlx_frustration",
        required: "conditional",
        numeric: true,
        min: 0,
        max: 100,
      },
      {
        name: "sus_item_1",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_2",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_3",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_4",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_5",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_6",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_7",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_8",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_9",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
      {
        name: "sus_item_10",
        required: "conditional",
        numeric: true,
        min: 1,
        max: 5,
        integer: true,
      },
    ],
  },
  "report_audit_rows.csv": {
    fileName: "report_audit_rows.csv",
    columns: [
      { name: "report_id", required: "yes" },
      { name: "study_id", required: "yes" },
      {
        name: "phase",
        required: "yes",
        allowedValues: ["baseline", "post_tool"],
      },
      {
        name: "duration_sec",
        required: "yes",
        numeric: true,
        exclusiveMin: 0,
      },
      {
        name: "required_measurement_count",
        required: "yes",
        numeric: true,
        min: 0,
        integer: true,
      },
      {
        name: "documented_measurement_count",
        required: "yes",
        numeric: true,
        min: 0,
        integer: true,
      },
      {
        name: "explicit_zscore_documented",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "explicit_percentile_documented",
        required: "yes",
        allowedValues: BOOLEAN_VALUES,
      },
      {
        name: "recommendation_congruent",
        required: "conditional",
        allowedValues: BOOLEAN_VALUES,
      },
    ],
  },
};

const isMissing = (
  value: string | number | boolean | null | undefined
): boolean =>
  value == null || (typeof value === "string" && value.trim() === "");

const isFalseLike = (
  value: string | number | boolean | null | undefined
): boolean =>
  value === false || value === 0 || value === "false" || value === "0";

const isTrueLike = (
  value: string | number | boolean | null | undefined
): boolean =>
  value === true || value === 1 || value === "true" || value === "1";

const isFiniteNumericValue = (
  value: string | number | boolean | null | undefined
): boolean => {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string" || value.trim() === "") return false;
  return Number.isFinite(Number(value));
};

const numericValue = (
  value: string | number | boolean | null | undefined
): number | null => {
  if (!isFiniteNumericValue(value)) return null;
  return Number(value);
};

const rangeMessage = (
  rowLabel: string,
  column: ValidationDataColumnSchema
): string => {
  if (column.min != null && column.max != null) {
    return `${rowLabel} field ${column.name} must be between ${column.min} and ${column.max}`;
  }
  if (column.min != null) {
    return `${rowLabel} field ${column.name} must be greater than or equal to ${column.min}`;
  }
  return `${rowLabel} field ${column.name} must be less than or equal to ${column.max}`;
};

const pushMissingGroupFields = (
  errors: string[],
  rowLabel: string,
  row: ValidationDataRow,
  columns: readonly string[],
  groupLabel: string
): void => {
  if (!columns.some(column => !isMissing(row[column]))) return;

  for (const column of columns) {
    if (isMissing(row[column])) {
      errors.push(
        `${rowLabel} requires ${column} when any ${groupLabel} field is present`
      );
    }
  }
};

export const validateValidationDataRows = (
  fileName: string,
  rows: readonly ValidationDataRow[]
): string[] => {
  if (!(fileName in VALIDATION_DATA_SCHEMAS)) {
    return [`unknown validation data file ${fileName}`];
  }

  const schema = VALIDATION_DATA_SCHEMAS[fileName as ValidationDataFileName];
  const requiredColumns = schema.columns.filter(
    column => column.required === "yes"
  );
  const errors: string[] = [];

  rows.forEach((row, rowIndex) => {
    const rowLabel = `${schema.fileName} row ${rowIndex + 1}`;
    for (const column of requiredColumns) {
      if (isMissing(row[column.name])) {
        errors.push(`${rowLabel} missing required field ${column.name}`);
      }
    }

    for (const column of schema.columns) {
      const value = row[column.name];
      if (isMissing(value)) continue;
      if (column.numeric) {
        if (!isFiniteNumericValue(value)) {
          errors.push(`${rowLabel} field ${column.name} must be finite`);
          continue;
        }
        const numberValue = numericValue(value);
        if (
          column.integer &&
          numberValue != null &&
          !Number.isInteger(numberValue)
        ) {
          errors.push(`${rowLabel} field ${column.name} must be an integer`);
        }
        if (
          (column.min != null || column.max != null) &&
          numberValue != null &&
          ((column.min != null && numberValue < column.min) ||
            (column.max != null && numberValue > column.max))
        ) {
          errors.push(rangeMessage(rowLabel, column));
        }
        if (
          column.exclusiveMin != null &&
          numberValue != null &&
          numberValue <= column.exclusiveMin
        ) {
          errors.push(
            `${rowLabel} field ${column.name} must be greater than ${column.exclusiveMin}`
          );
        }
      }
      if (
        column.allowedValues &&
        !column.allowedValues.includes(String(value))
      ) {
        errors.push(
          `${rowLabel} field ${column.name} must be one of ${column.allowedValues.join(
            ", "
          )}`
        );
      }
    }

    if (
      schema.fileName === "case_log.csv" &&
      isFalseLike(row.included) &&
      isMissing(row.exclusion_reason)
    ) {
      errors.push(
        `${rowLabel} requires exclusion_reason when included is false`
      );
    }
    if (
      schema.fileName === "case_log.csv" &&
      isTrueLike(row.included) &&
      !isMissing(row.exclusion_reason)
    ) {
      errors.push(
        `${rowLabel} must not include exclusion_reason when included is true`
      );
    }

    if (schema.fileName === "measurement_rows.csv") {
      const hasValueMm = !isMissing(row.value_mm);
      const hasValueDeg = !isMissing(row.value_deg);
      const parameterId = isMissing(row.parameter_id)
        ? null
        : String(row.parameter_id);
      const parameterUnit =
        parameterId == null ? null : PARAMETER_UNITS_BY_ID.get(parameterId);
      const sourceRole = isMissing(row.source_role)
        ? null
        : String(row.source_role);
      if (sourceRole === "reader" && isMissing(row.reader_id)) {
        errors.push(
          `${rowLabel} requires reader_id when source_role is reader`
        );
      }
      if (
        sourceRole != null &&
        sourceRole !== "reader" &&
        !isMissing(row.reader_id)
      ) {
        errors.push(
          `${rowLabel} must not include reader_id unless source_role is reader`
        );
      }
      if (isTrueLike(row.measurement_available)) {
        if (!hasValueMm && !hasValueDeg) {
          errors.push(
            `${rowLabel} requires value_mm or value_deg when measurement_available is true`
          );
        }
        if (hasValueMm && hasValueDeg) {
          errors.push(
            `${rowLabel} requires exactly one of value_mm or value_deg when measurement_available is true`
          );
        }
        if (parameterUnit === "mm" && hasValueDeg) {
          errors.push(
            `${rowLabel} field value_deg is not allowed for millimetre parameter ${parameterId}`
          );
        }
        if (parameterUnit === "degrees" && hasValueMm) {
          errors.push(
            `${rowLabel} field value_mm is not allowed for degree parameter ${parameterId}`
          );
        }
        if (!isMissing(row.missing_reason)) {
          errors.push(
            `${rowLabel} must not include missing_reason when measurement_available is true`
          );
        }
      }
      if (
        isFalseLike(row.measurement_available) &&
        isMissing(row.missing_reason)
      ) {
        errors.push(
          `${rowLabel} requires missing_reason when measurement_available is false`
        );
      }
      if (
        isFalseLike(row.measurement_available) &&
        (hasValueMm || hasValueDeg)
      ) {
        errors.push(
          `${rowLabel} must not include value_mm or value_deg when measurement_available is false`
        );
      }
    }

    if (
      schema.fileName === "diagnostic_labels.csv" &&
      isTrueLike(row.indeterminate) &&
      isMissing(row.indeterminate_reason)
    ) {
      errors.push(
        `${rowLabel} requires indeterminate_reason when indeterminate is true`
      );
    }
    if (
      schema.fileName === "diagnostic_labels.csv" &&
      isTrueLike(row.indeterminate)
    ) {
      for (const column of [
        "reference_label",
        "predicted_label",
        "predicted_probability",
      ]) {
        if (!isMissing(row[column])) {
          errors.push(
            `${rowLabel} must not include ${column} when indeterminate is true`
          );
        }
      }
    }
    if (
      schema.fileName === "diagnostic_labels.csv" &&
      isFalseLike(row.indeterminate) &&
      !isMissing(row.indeterminate_reason)
    ) {
      errors.push(
        `${rowLabel} must not include indeterminate_reason when indeterminate is false`
      );
    }
    if (
      schema.fileName === "diagnostic_labels.csv" &&
      isFalseLike(row.indeterminate)
    ) {
      for (const column of ["reference_label", "predicted_label"]) {
        if (isMissing(row[column])) {
          errors.push(`${rowLabel} missing required field ${column}`);
        }
      }
    }
    if (schema.fileName === "diagnostic_labels.csv") {
      const predictedProbability = numericValue(row.predicted_probability);
      const threshold = numericValue(row.threshold);
      const predictedLabel = isTrueLike(row.predicted_label)
        ? true
        : isFalseLike(row.predicted_label)
          ? false
          : null;
      const isDeterminate = isFalseLike(row.indeterminate);
      if (threshold != null && (threshold <= 0 || threshold >= 1)) {
        errors.push(
          `${rowLabel} field threshold must be greater than 0 and less than 1`
        );
      }
      if (
        isDeterminate &&
        predictedProbability != null &&
        threshold != null &&
        predictedLabel != null &&
        predictedProbability >= 0 &&
        predictedProbability <= 1 &&
        threshold > 0 &&
        threshold < 1
      ) {
        const expectedLabel = predictedProbability >= threshold;
        if (predictedLabel !== expectedLabel) {
          errors.push(
            `${rowLabel} predicted_label ${predictedLabel} does not match predicted_probability ${predictedProbability} at threshold ${threshold}; expected ${expectedLabel}`
          );
        }
      }
    }

    if (schema.fileName === "reader_study_rows.csv") {
      const hasAnySusItem = SUS_COLUMNS.some(column => !isMissing(row[column]));
      pushMissingGroupFields(
        errors,
        rowLabel,
        row,
        NASA_TLX_COLUMNS,
        "NASA Task Load Index"
      );
      pushMissingGroupFields(
        errors,
        rowLabel,
        row,
        SUS_COLUMNS,
        "System Usability Scale"
      );
      if (hasAnySusItem && stringValue(row.condition) !== "with_tool") {
        errors.push(
          `${rowLabel} must not include System Usability Scale fields unless condition is with_tool`
        );
      }
    }

    if (schema.fileName === "report_audit_rows.csv") {
      const requiredMeasurementCount = numericValue(
        row.required_measurement_count
      );
      const documentedMeasurementCount = numericValue(
        row.documented_measurement_count
      );

      if (requiredMeasurementCount != null && requiredMeasurementCount <= 0) {
        errors.push(
          `${rowLabel} field required_measurement_count must be greater than 0`
        );
      }
      if (
        requiredMeasurementCount != null &&
        documentedMeasurementCount != null &&
        documentedMeasurementCount > requiredMeasurementCount
      ) {
        errors.push(
          `${rowLabel} field documented_measurement_count cannot exceed required_measurement_count`
        );
      }
    }
  });

  return errors;
};

const stringValue = (
  value: string | number | boolean | null | undefined
): string | null => (isMissing(value) ? null : String(value));

const pushMissingCaseReferences = (
  errors: string[],
  fileName: ValidationDataFileName,
  rows: readonly ValidationDataRow[],
  caseIds: Set<string>
): void => {
  rows.forEach((row, rowIndex) => {
    const studyId = stringValue(row.study_id);
    if (studyId != null && !caseIds.has(studyId)) {
      errors.push(
        `${fileName} row ${rowIndex + 1} references missing study_id ${studyId} in case_log.csv`
      );
    }
  });
};

const pushExcludedCaseReferences = (
  errors: string[],
  fileName: ValidationDataFileName,
  rows: readonly ValidationDataRow[],
  excludedCaseIds: Set<string>
): void => {
  rows.forEach((row, rowIndex) => {
    const studyId = stringValue(row.study_id);
    if (studyId != null && excludedCaseIds.has(studyId)) {
      errors.push(
        `${fileName} row ${rowIndex + 1} references excluded study_id ${studyId} in case_log.csv`
      );
    }
  });
};

const pushMeasurementAvailabilityErrors = (
  errors: string[],
  rows: readonly ValidationDataRow[],
  caseRowsById: Map<string, ValidationDataRow>
): void => {
  rows.forEach((row, rowIndex) => {
    if (!isTrueLike(row.measurement_available)) return;
    const studyId = stringValue(row.study_id);
    if (studyId == null) return;
    const caseRow = caseRowsById.get(studyId);
    if (caseRow == null) return;

    const sourceRole = stringValue(row.source_role);
    if (
      sourceRole === "reference" &&
      isFalseLike(caseRow.reference_standard_available)
    ) {
      errors.push(
        `measurement_rows.csv row ${rowIndex + 1} source_role reference requires case_log.csv study_id ${studyId} reference_standard_available=true`
      );
    }
    if (
      (sourceRole === "calculator" || sourceRole === "ai_prefill") &&
      isFalseLike(caseRow.prediction_available)
    ) {
      errors.push(
        `measurement_rows.csv row ${rowIndex + 1} source_role ${sourceRole} requires case_log.csv study_id ${studyId} prediction_available=true`
      );
    }
  });
};

const pushDeterminateDiagnosticAvailabilityErrors = (
  errors: string[],
  rows: readonly ValidationDataRow[],
  caseRowsById: Map<string, ValidationDataRow>
): void => {
  rows.forEach((row, rowIndex) => {
    if (!isFalseLike(row.indeterminate)) return;
    const studyId = stringValue(row.study_id);
    if (studyId == null) return;
    const caseRow = caseRowsById.get(studyId);
    if (caseRow == null) return;

    for (const field of [
      "reference_standard_available",
      "prediction_available",
      "pathology_label_available",
    ]) {
      if (isFalseLike(caseRow[field])) {
        errors.push(
          `diagnostic_labels.csv row ${rowIndex + 1} is determinate but case_log.csv study_id ${studyId} has ${field}=false`
        );
      }
    }
  });
};

export const validateValidationDataExport = (
  data: ValidationDataExport
): string[] => {
  const errors: string[] = [];
  for (const fileName of VALIDATION_DATA_FILE_ORDER) {
    errors.push(...validateValidationDataRows(fileName, data[fileName] ?? []));
  }

  const caseIdCounts = new Map<string, number>();
  const caseRowsById = new Map<string, ValidationDataRow>();
  for (const row of data["case_log.csv"] ?? []) {
    const studyId = stringValue(row.study_id);
    if (studyId == null) continue;
    caseIdCounts.set(studyId, (caseIdCounts.get(studyId) ?? 0) + 1);
    caseRowsById.set(studyId, row);
  }

  caseIdCounts.forEach((count, studyId) => {
    if (count > 1) {
      errors.push(
        `case_log.csv study_id ${studyId} appears ${count} times; expected exactly one`
      );
    }
  });

  const caseIds = new Set(caseIdCounts.keys());
  const excludedCaseIds = new Set<string>();
  for (const row of data["case_log.csv"] ?? []) {
    const studyId = stringValue(row.study_id);
    if (studyId != null && isFalseLike(row.included)) {
      excludedCaseIds.add(studyId);
    }
  }

  pushMissingCaseReferences(
    errors,
    "measurement_rows.csv",
    data["measurement_rows.csv"] ?? [],
    caseIds
  );
  pushExcludedCaseReferences(
    errors,
    "measurement_rows.csv",
    data["measurement_rows.csv"] ?? [],
    excludedCaseIds
  );
  pushMeasurementAvailabilityErrors(
    errors,
    data["measurement_rows.csv"] ?? [],
    caseRowsById
  );
  const measurementRowCounts = new Map<string, number>();
  for (const row of data["measurement_rows.csv"] ?? []) {
    const studyId = stringValue(row.study_id);
    const parameterId = stringValue(row.parameter_id);
    const sourceRole = stringValue(row.source_role);
    const readerId = stringValue(row.reader_id) ?? "none";
    if (studyId == null || parameterId == null || sourceRole == null) continue;
    const key = `${studyId}\u0000${parameterId}\u0000${sourceRole}\u0000${readerId}`;
    measurementRowCounts.set(key, (measurementRowCounts.get(key) ?? 0) + 1);
  }
  measurementRowCounts.forEach((count, key) => {
    if (count > 1) {
      const [studyId, parameterId, sourceRole, readerId] = key.split("\u0000");
      errors.push(
        `measurement_rows.csv study ${studyId} parameter ${parameterId} source_role ${sourceRole} reader ${readerId} appears ${count} times; expected exactly one`
      );
    }
  });
  pushMissingCaseReferences(
    errors,
    "diagnostic_labels.csv",
    data["diagnostic_labels.csv"] ?? [],
    caseIds
  );
  pushExcludedCaseReferences(
    errors,
    "diagnostic_labels.csv",
    data["diagnostic_labels.csv"] ?? [],
    excludedCaseIds
  );
  pushDeterminateDiagnosticAvailabilityErrors(
    errors,
    data["diagnostic_labels.csv"] ?? [],
    caseRowsById
  );
  const diagnosticLabelCounts = new Map<string, number>();
  for (const row of data["diagnostic_labels.csv"] ?? []) {
    const studyId = stringValue(row.study_id);
    const triggerId = stringValue(row.trigger_id);
    if (studyId == null || triggerId == null) continue;
    const key = `${studyId}\u0000${triggerId}`;
    diagnosticLabelCounts.set(key, (diagnosticLabelCounts.get(key) ?? 0) + 1);
  }
  diagnosticLabelCounts.forEach((count, key) => {
    if (count > 1) {
      const [studyId, triggerId] = key.split("\u0000");
      errors.push(
        `diagnostic_labels.csv study ${studyId} trigger ${triggerId} appears ${count} times; expected exactly one`
      );
    }
  });
  pushMissingCaseReferences(
    errors,
    "reader_study_rows.csv",
    data["reader_study_rows.csv"] ?? [],
    caseIds
  );
  pushExcludedCaseReferences(
    errors,
    "reader_study_rows.csv",
    data["reader_study_rows.csv"] ?? [],
    excludedCaseIds
  );
  pushMissingCaseReferences(
    errors,
    "report_audit_rows.csv",
    data["report_audit_rows.csv"] ?? [],
    caseIds
  );
  pushExcludedCaseReferences(
    errors,
    "report_audit_rows.csv",
    data["report_audit_rows.csv"] ?? [],
    excludedCaseIds
  );
  const reportIdCounts = new Map<string, number>();
  for (const row of data["report_audit_rows.csv"] ?? []) {
    const reportId = stringValue(row.report_id);
    if (reportId == null) continue;
    reportIdCounts.set(reportId, (reportIdCounts.get(reportId) ?? 0) + 1);
  }
  reportIdCounts.forEach((count, reportId) => {
    if (count > 1) {
      errors.push(
        `report_audit_rows.csv report_id ${reportId} appears ${count} times; expected exactly one`
      );
    }
  });

  const readerReadOrderCounts = new Map<string, number>();
  for (const row of data["reader_study_rows.csv"] ?? []) {
    const readerId = stringValue(row.reader_id);
    const readOrder = numericValue(row.read_order);
    if (readerId == null || readOrder == null) continue;
    const key = `${readerId}\u0000${readOrder}`;
    readerReadOrderCounts.set(key, (readerReadOrderCounts.get(key) ?? 0) + 1);
  }
  readerReadOrderCounts.forEach((count, key) => {
    if (count > 1) {
      const [readerId, readOrder] = key.split("\u0000");
      errors.push(
        `reader_study_rows.csv reader ${readerId} read_order ${readOrder} appears ${count} times; expected unique sequence positions`
      );
    }
  });

  const readerPairs = new Map<string, Map<string, number>>();
  const readerPairWashouts = new Map<string, Set<number>>();
  for (const row of data["reader_study_rows.csv"] ?? []) {
    const readerId = stringValue(row.reader_id);
    const studyId = stringValue(row.study_id);
    const condition = stringValue(row.condition);
    if (
      readerId == null ||
      studyId == null ||
      (condition !== "without_tool" && condition !== "with_tool")
    ) {
      continue;
    }
    const key = `${readerId}\u0000${studyId}`;
    const conditionCounts = readerPairs.get(key) ?? new Map<string, number>();
    conditionCounts.set(condition, (conditionCounts.get(condition) ?? 0) + 1);
    readerPairs.set(key, conditionCounts);

    const washoutDays = numericValue(row.washout_days);
    if (washoutDays != null) {
      const washouts = readerPairWashouts.get(key) ?? new Set<number>();
      washouts.add(washoutDays);
      readerPairWashouts.set(key, washouts);
    }
  }

  readerPairs.forEach((conditionCounts, key) => {
    for (const condition of ["without_tool", "with_tool"]) {
      const count = conditionCounts.get(condition) ?? 0;
      if (count > 1) {
        const [readerId, studyId] = key.split("\u0000");
        errors.push(
          `reader_study_rows.csv reader ${readerId} study ${studyId} has ${count} ${condition} rows; expected exactly one`
        );
      }
    }
    if (
      !conditionCounts.has("without_tool") ||
      !conditionCounts.has("with_tool")
    ) {
      const [readerId, studyId] = key.split("\u0000");
      errors.push(
        `reader_study_rows.csv reader ${readerId} study ${studyId} must include both without_tool and with_tool rows`
      );
    }
  });
  readerPairWashouts.forEach((washouts, key) => {
    if (washouts.size <= 1) return;
    const [readerId, studyId] = key.split("\u0000");
    const values = Array.from(washouts).sort((left, right) => left - right);
    const valueText =
      values.length === 2 ? `${values[0]} and ${values[1]}` : values.join(", ");
    errors.push(
      `reader_study_rows.csv reader ${readerId} study ${studyId} has inconsistent washout_days values ${valueText}; expected one paired interval`
    );
  });

  return errors;
};
