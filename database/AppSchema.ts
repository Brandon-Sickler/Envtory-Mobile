import { column, Schema, Table } from '@powersync/react-native';
// OR: import { column, Schema, Table } from '@powersync/react-native';

const runs = new Table(
  {
    // id column (text) is automatically included
    end_time: column.text,
    start_time: column.text,
    status: column.text
  },
  { indexes: {} }
);

const lumber_boards = new Table(
  {
    // id column (text) is automatically included
    board_footage: column.real,
    length: column.real,
    surface_measure: column.integer,
    thickness: column.real,
    width: column.real,
    bundle_id: column.text,
    run_id: column.text,
    grade: column.text,
    species: column.text
  },
  { indexes: {} }
);

const lumber_bundles = new Table(
  {
    // id column (text) is automatically included
    thickness: column.real,
    total_board_footage: column.real,
    load_id: column.text,
    run_id: column.text,
    grade: column.text,
    moisture_state: column.text,
    pack_number: column.text,
    species: column.text
  },
  { indexes: {} }
);

const run_grades_allowed = new Table(
  {
    // id column (text) is automatically included
    run_id: column.text,
    grades_allowed: column.text
  },
  { indexes: {} }
);

const run_species_allowed = new Table(
  {
    // id column (text) is automatically included
    run_id: column.text,
    species_allowed: column.text
  },
  { indexes: {} }
);

const run_thicknesses_allowed = new Table(
  {
    // id column (text) is automatically included
    thicknesses_allowed: column.real,
    run_id: column.text
  },
  { indexes: {} }
);

const lumber_bundle_lengths_included = new Table(
  {
    // id column (text) is automatically included
    lengths_included: column.real,
    lumber_bundle_id: column.text
  },
  { indexes: {} }
);

export const AppSchema = new Schema({
  runs,
  lumber_boards,
  lumber_bundles,
  run_grades_allowed,
  run_species_allowed,
  run_thicknesses_allowed,
  lumber_bundle_lengths_included
});

export type Database = (typeof AppSchema)['types'];

