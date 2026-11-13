import {FuelType} from '../../../equipment/domain/model/hvof-system.entity';
import {RecipeApplicability, RecipeParameter} from '../../../equipment/domain/model/recipe.entity';
import {ComponentType} from '../../../traceability/domain/model/component.entity';

/**
 * Demo plant used by the quick start: one HVOF system with its FESA subsystems, an active recipe,
 * a mining customer with a hydraulic rod and an open recuperation order.
 * Every record carries a stable natural key (code, recipe number, RUC, serial number, work order) so the
 * provisioning is idempotent: records that already exist are reused, never duplicated.
 */
export const DEMO_PLANT = {
  hvofSystem: {
    code: 'HVOF-01', serialNumber: 'DJ2700-PE-0142', systemManufacturer: 'Oerlikon Metco',
    systemModel: 'MultiCoat / Diamond Jet 2700', fuelType: 'HYDROGEN' as FuelType
  },
  subsystems: [
    {subsystemType: 'GAS_CONSOLE',   name: 'Consola de gases',       alias: 'HVOF', parameters: ['fuel_gas_flow', 'oxygen_flow', 'cooling_air_flow']},
    {subsystemType: 'POWDER_FEEDER', name: 'Alimentador de polvo',   alias: 'FDR1', parameters: ['powder_feed_rate', 'carrier_gas_flow', 'hopper_pressure']},
    {subsystemType: 'COOLING_UNIT',  name: 'Unidad de enfriamiento', alias: 'CM',   parameters: ['coolant_flow', 'coolant_outlet_temp']},
    {subsystemType: 'MANIPULATOR',   name: 'Torno y ejes',           alias: 'SPX',  parameters: ['spindle_speed']}
  ],
  controller: {
    controllerNumber: 1, deviceType: 'PLC', serialNumber: 'CLX-5580-0142', manufacturer: 'Rockwell Automation', model: '1756-L83E',
    partNumber: '1756-L83E', ipAddress: '192.168.10.21', port: 44818, rack: 0, slot: 0, endpointUrl: null, tagCatalogId: null,
    supportedProtocols: [{protocol: 'ETHERNET_IP'}]
  },
  recipe: {
    recipeNumber: 12, name: 'WC-10Co-4Cr sobre vástago hidráulico', powderSpecification: 'Diamalloy 5849 (WC-10Co-4Cr), -45+15 µm',
    applicabilities: [
      {componentType: 'HYDRAULIC_ROD', machineModel: 'CAT 797F', position: 'Cilindro de levante'},
      {componentType: 'HYDRAULIC_ROD', machineModel: 'CAT 793F', position: 'Cilindro de levante'}
    ] as RecipeApplicability[],
    parameters: [
      {parameter: 'fuel_gas_flow',       setpoint: 160, lowerShutdown: 130, lowerWarning: 145, nominalMin: 152, nominalMax: 168, upperWarning: 175, upperShutdown: 190,  unitSymbol: 'SCFH',  unitCategory: 'flow'},
      {parameter: 'oxygen_flow',         setpoint: 550, lowerShutdown: 470, lowerWarning: 510, nominalMin: 530, nominalMax: 570, upperWarning: 590, upperShutdown: 630,  unitSymbol: 'SCFH',  unitCategory: 'flow'},
      {parameter: 'cooling_air_flow',    setpoint: 860, lowerShutdown: 700, lowerWarning: 780, nominalMin: 830, nominalMax: 890, upperWarning: 940, upperShutdown: 1000, unitSymbol: 'SCFH',  unitCategory: 'flow'},
      {parameter: 'powder_feed_rate',    setpoint: 700, lowerShutdown: 560, lowerWarning: 630, nominalMin: 670, nominalMax: 730, upperWarning: 770, upperShutdown: 840,  unitSymbol: 'g/min', unitCategory: 'mass_flow'},
      {parameter: 'carrier_gas_flow',    setpoint: 300, lowerShutdown: 240, lowerWarning: 270, nominalMin: 285, nominalMax: 315, upperWarning: 330, upperShutdown: 360,  unitSymbol: 'SCFH',  unitCategory: 'flow'},
      {parameter: 'hopper_pressure',     setpoint: 130, lowerShutdown: 100, lowerWarning: 115, nominalMin: 122, nominalMax: 145, upperWarning: 155, upperShutdown: 170,  unitSymbol: 'psi',   unitCategory: 'pressure'},
      {parameter: 'coolant_flow',        setpoint: 4.8, lowerShutdown: 3.5, lowerWarning: 4,   nominalMin: 4.4, nominalMax: 5.4, upperWarning: 6,   upperShutdown: 7,    unitSymbol: 'gpm',   unitCategory: 'flow'},
      {parameter: 'coolant_outlet_temp', setpoint: 72,  lowerShutdown: 40,  lowerWarning: 50,  nominalMin: 60,  nominalMax: 85,  upperWarning: 95,  upperShutdown: 110,  unitSymbol: '°F',    unitCategory: 'temperature'},
      {parameter: 'spindle_speed',       setpoint: 73,  lowerShutdown: 55,  lowerWarning: 62,  nominalMin: 66,  nominalMax: 80,  upperWarning: 85,  upperShutdown: 95,   unitSymbol: 'rpm',   unitCategory: 'speed'}
    ] as RecipeParameter[]
  },
  customer: {legalName: 'Sociedad Minera Cerro Verde S.A.A.', ruc: '20170072465', mineSite: 'Cerro Verde - Arequipa'},
  component: {
    serialNumber: 'CV-797F-LC-0451', partNumber: '263-4792', componentType: 'HYDRAULIC_ROD' as ComponentType,
    machineManufacturer: 'Caterpillar', machineModel: '797F', pcrTargetHours: 12000
  },
  recuperation: {
    workOrderNumber: 'WO-2026-1408', manufacturingOrderNumber: 'OF-45110', operation: 'HVOF WC-10Co-4Cr zona de sello',
    weightValue: 186, weightUnitSymbol: 'kg', hourmeterAtEntry: 11240, segment: 'Mining',
    powderSupplier: 'Oerlikon Metco', powderLotNumber: 'D5849-26L0817', powderChemicalComposition: 'WC-10Co-4Cr'
  }
} as const;

export type QuickStartStep = 'hvof-system' | 'subsystems' | 'controller' | 'recipe' | 'customer' | 'component' | 'recuperation' | 'session';

/** Ordered steps of the provisioning, used by the view to render the progress. */
export const QUICK_START_STEPS: QuickStartStep[] = ['hvof-system', 'subsystems', 'controller', 'recipe', 'customer', 'component', 'recuperation', 'session'];
