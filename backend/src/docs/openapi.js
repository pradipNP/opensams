const config = require('../config');

const errorShape = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'FORBIDDEN' },
        message: { type: 'string' },
        details: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

const paginationMeta = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 27 },
    totalPages: { type: 'integer', example: 2 },
  },
};

const municipality = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
    code: { type: 'string', example: 'BTW' },
    district: { type: 'string', example: 'Rupandehi' },
    provinceId: { type: 'string', format: 'uuid' },
    provinceName: { type: 'string', example: 'Lumbini Province' },
    schoolCount: { type: 'integer', example: 10 },
    assetCount: { type: 'integer', example: 185 },
    isActive: { type: 'boolean', example: true },
  },
};

const schoolListItem = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Kalika Manavgyan Secondary School' },
    schoolCode: { type: 'string', example: 'BTW-KMG' },
    schoolType: { type: 'string', example: 'Secondary' },
    address: { type: 'string', nullable: true },
    municipalityId: { type: 'string', format: 'uuid' },
    municipalityName: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
    municipalityCode: { type: 'string', example: 'BTW' },
    assetCount: { type: 'integer', example: 19 },
    isActive: { type: 'boolean', example: true },
  },
};

const schoolDetail = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    schoolCode: { type: 'string' },
    schoolType: { type: 'string' },
    address: { type: 'string', nullable: true },
    municipality: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        code: { type: 'string' },
      },
    },
    stats: {
      type: 'object',
      properties: {
        totalAssets: { type: 'integer' },
        activeAssets: { type: 'integer' },
        damagedAssets: { type: 'integer' },
        underMaintenance: { type: 'integer' },
        totalValue: { type: 'number', example: 485000.0 },
      },
    },
    isActive: { type: 'boolean' },
  },
};

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'SAMS Nepal API',
    description:
      'School Asset Management System for Nepal. Phases 1–8: authentication, schools, assets, dashboard, maintenance, transfers, JSON reports, Excel/PDF export, lookup APIs, municipality/school writes, and user management.',
    version: config.version,
  },
  servers: [
    { url: '/api/v1', description: 'Current server' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Authentication' },
    { name: 'Dashboard' },
    { name: 'Maintenance' },
    { name: 'Transfers' },
    { name: 'Reports' },
    { name: 'Provinces' },
    { name: 'Municipalities' },
    { name: 'Schools' },
    { name: 'Categories' },
    { name: 'Statuses' },
    { name: 'Users' },
    { name: 'Assets' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: errorShape,
      PaginationMeta: paginationMeta,
      Municipality: municipality,
      SchoolListItem: schoolListItem,
      SchoolDetail: schoolDetail,
      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          assetTag: { type: 'string', example: 'SAMS-BTW-2026-0001' },
          name: { type: 'string' },
          category: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              department: { type: 'string' },
            },
          },
          status: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              slug: { type: 'string' },
              colorCode: { type: 'string', example: '#16A34A' },
            },
          },
          school: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              schoolCode: { type: 'string' },
            },
          },
          municipality: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
          department: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          purchaseDate: { type: 'string', format: 'date', nullable: true },
          purchaseCost: { type: 'number', example: 12500 },
          warrantyExpiry: { type: 'string', format: 'date', nullable: true },
          vendor: { type: 'string', nullable: true },
          qrCode: { type: 'string', example: 'https://sams.gov.np/verify/SAMS-BTW-2026-0001' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AssetCreateRequest: {
        type: 'object',
        required: ['name', 'categoryId', 'schoolId', 'statusId'],
        properties: {
          name: { type: 'string', example: 'Dell Latitude Laptop' },
          categoryId: { type: 'string', format: 'uuid' },
          schoolId: { type: 'string', format: 'uuid' },
          statusId: { type: 'string', format: 'uuid' },
          department: { type: 'string' },
          location: { type: 'string' },
          purchaseDate: { type: 'string', format: 'date' },
          purchaseCost: { type: 'number', minimum: 0 },
          warrantyExpiry: { type: 'string', format: 'date' },
          vendor: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      AssetHistoryItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          action: { type: 'string', example: 'created' },
          fieldName: { type: 'string', nullable: true },
          oldValue: { type: 'string', nullable: true },
          newValue: { type: 'string', nullable: true },
          changedBy: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'state.admin@sams.gov.np' },
          password: { type: 'string', example: 'password' },
        },
      },
      Transfer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          asset: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              assetTag: { type: 'string', example: 'SAMS-BTW-2026-0001' },
              name: { type: 'string', example: 'Desktop Computer' },
              status: { type: 'string', example: 'Active' },
            },
          },
          fromSchool: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Kalika Manavgyan Secondary School' },
              schoolCode: { type: 'string', example: 'BTW-KMG' },
              municipality: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
          toSchool: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Amar Secondary School' },
              schoolCode: { type: 'string' },
              municipality: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
          requestedBy: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          approvedBy: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          status: {
            type: 'string',
            enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'],
            example: 'pending',
          },
          reason: { type: 'string', example: 'Computer lab expansion' },
          rejectionReason: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          transferDate: { type: 'string', format: 'date', nullable: true },
          requestedAt: { type: 'string', format: 'date-time' },
          approvedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TransferCreateRequest: {
        type: 'object',
        required: ['assetId', 'toSchoolId', 'reason'],
        properties: {
          assetId: { type: 'string', format: 'uuid' },
          toSchoolId: { type: 'string', format: 'uuid' },
          reason: { type: 'string', example: 'Computer lab expansion' },
          notes: { type: 'string', example: 'Approved by municipality' },
        },
      },
      InventoryReportItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          assetTag: { type: 'string', example: 'SAMS-BTW-2026-0039' },
          name: { type: 'string', example: 'Laptops — BTW-KMG-001' },
          category: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Laptops' },
              department: { type: 'string', example: 'Computer Lab Assets' },
            },
          },
          status: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Active' },
              slug: { type: 'string', example: 'active' },
              colorCode: { type: 'string', example: '#16A34A' },
            },
          },
          schoolId: { type: 'string', format: 'uuid' },
          school: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Kalika Manavgyan Secondary School' },
              schoolCode: { type: 'string', example: 'BTW-KMG' },
            },
          },
          municipalityId: { type: 'string', format: 'uuid' },
          municipality: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
              code: { type: 'string', example: 'BTW' },
            },
          },
          department: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          purchaseDate: { type: 'string', format: 'date', nullable: true },
          purchaseCost: { type: 'number', example: 12500 },
          warrantyExpiry: { type: 'string', format: 'date', nullable: true },
          vendor: { type: 'string', nullable: true },
          qrCode: { type: 'string' },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MunicipalityReportItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
          code: { type: 'string', example: 'BTW' },
          provinceId: { type: 'string', format: 'uuid' },
          province: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Lumbini Province' },
            },
          },
          totalSchools: { type: 'integer', example: 10 },
          totalAssets: { type: 'integer', example: 190 },
          activeAssets: { type: 'integer', example: 130 },
          damagedAssets: { type: 'integer', example: 20 },
          underMaintenanceAssets: { type: 'integer', example: 15 },
          disposedAssets: { type: 'integer', example: 10 },
          lostAssets: { type: 'integer', example: 15 },
          totalAssetValue: { type: 'number', example: 4250000 },
        },
      },
      SchoolReportItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Kalika Manavgyan Secondary School' },
          schoolCode: { type: 'string', example: 'BTW-KMG' },
          schoolType: { type: 'string', example: 'Secondary' },
          municipalityId: { type: 'string', format: 'uuid' },
          municipality: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
              code: { type: 'string', example: 'BTW' },
            },
          },
          provinceId: { type: 'string', format: 'uuid' },
          province: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Lumbini Province' },
            },
          },
          totalAssets: { type: 'integer', example: 18 },
          activeAssets: { type: 'integer', example: 12 },
          damagedAssets: { type: 'integer', example: 2 },
          underMaintenanceAssets: { type: 'integer', example: 1 },
          disposedAssets: { type: 'integer', example: 2 },
          lostAssets: { type: 'integer', example: 1 },
          totalAssetValue: { type: 'number', example: 425000 },
        },
      },
      MaintenanceReportItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          assetId: { type: 'string', format: 'uuid' },
          asset: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              assetTag: { type: 'string', example: 'SAMS-BTW-2026-0001' },
              name: { type: 'string' },
            },
          },
          school: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Amar Secondary School' },
              schoolCode: { type: 'string', example: 'BTW-AMR' },
            },
          },
          municipality: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
              code: { type: 'string', example: 'BTW' },
            },
          },
          description: { type: 'string', example: 'Projector bulb needs replacement' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent', 'critical'],
            example: 'high',
          },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'],
            example: 'completed',
          },
          estimatedCost: { type: 'number', nullable: true, example: 1000 },
          actualCost: { type: 'number', nullable: true, example: 900 },
          requestedBy: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          assignedTo: { type: 'string', nullable: true, description: 'Free-text assignee (not a user FK)' },
          approvedBy: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          requestedAt: { type: 'string', format: 'date-time' },
          approvedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          rejectionReason: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TransferReportItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          assetId: { type: 'string', format: 'uuid' },
          asset: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              assetTag: { type: 'string' },
              name: { type: 'string' },
            },
          },
          fromSchool: { $ref: '#/components/schemas/TransferSchool' },
          toSchool: { $ref: '#/components/schemas/TransferSchool' },
          status: {
            type: 'string',
            enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'],
          },
          reason: { type: 'string' },
          rejectionReason: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
          transferDate: { type: 'string', format: 'date', nullable: true },
          requestedBy: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          approvedBy: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fullName: { type: 'string' },
            },
          },
          requestedAt: { type: 'string', format: 'date-time' },
          approvedAt: { type: 'string', format: 'date-time', nullable: true },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      TransferSchool: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          schoolCode: { type: 'string' },
          municipality: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      Province: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Lumbini Province' },
          code: { type: 'string', example: 'LUM' },
          isActive: { type: 'boolean', example: true },
          municipalityCount: { type: 'integer', example: 3 },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Desks' },
          department: { type: 'string', example: 'Classroom Assets' },
          description: { type: 'string', nullable: true, example: 'Student and teacher desks' },
          assetCount: { type: 'integer', example: 45 },
          isActive: { type: 'boolean', example: true },
        },
      },
      Status: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Active' },
          slug: { type: 'string', example: 'active' },
          colorCode: { type: 'string', example: '#16A34A' },
          sortOrder: { type: 'integer', example: 1 },
        },
      },
      MunicipalityCreate: {
        type: 'object',
        required: ['name', 'code', 'provinceId', 'district'],
        properties: {
          name: { type: 'string', example: 'Butwal Sub-Metropolitan City' },
          code: { type: 'string', example: 'BTW' },
          provinceId: { type: 'string', format: 'uuid' },
          district: { type: 'string', example: 'Rupandehi' },
        },
      },
      MunicipalityUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          provinceId: { type: 'string', format: 'uuid' },
          district: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
      SchoolCreate: {
        type: 'object',
        required: ['name', 'schoolCode', 'schoolType', 'municipalityId'],
        properties: {
          name: { type: 'string', example: 'Kalika Manavgyan Secondary School' },
          schoolCode: { type: 'string', example: 'BTW-KMG' },
          schoolType: { type: 'string', example: 'Secondary' },
          municipalityId: { type: 'string', format: 'uuid' },
          address: { type: 'string', nullable: true },
        },
      },
      SchoolUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          schoolCode: { type: 'string' },
          schoolType: { type: 'string' },
          municipalityId: { type: 'string', format: 'uuid' },
          address: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['state_admin', 'municipal_officer', 'school_admin'] },
          roleName: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
          provinceId: { type: 'string', format: 'uuid', nullable: true },
          municipalityId: { type: 'string', format: 'uuid', nullable: true },
          schoolId: { type: 'string', format: 'uuid', nullable: true },
          isActive: { type: 'boolean' },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      UserCreate: {
        type: 'object',
        required: ['email', 'password', 'fullName', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['state_admin', 'municipal_officer', 'school_admin'] },
          provinceId: { type: 'string', format: 'uuid', nullable: true },
          municipalityId: { type: 'string', format: 'uuid', nullable: true },
          schoolId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
      UserUpdate: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['state_admin', 'municipal_officer', 'school_admin'] },
          provinceId: { type: 'string', format: 'uuid', nullable: true },
          municipalityId: { type: 'string', format: 'uuid', nullable: true },
          schoolId: { type: 'string', format: 'uuid', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      SummaryReport: {
        type: 'object',
        properties: {
          kpis: {
            type: 'object',
            properties: {
              totalAssets: { type: 'integer' },
              activeAssets: { type: 'integer' },
              damagedAssets: { type: 'integer' },
              underMaintenance: { type: 'integer' },
              disposedAssets: { type: 'integer' },
              lostAssets: { type: 'integer' },
              totalSchools: { type: 'integer' },
              totalMunicipalities: { type: 'integer' },
              totalAssetValue: { type: 'number' },
              pendingMaintenance: { type: 'integer' },
              completedMaintenance: { type: 'integer' },
              pendingTransfers: { type: 'integer' },
              approvedTransfers: { type: 'integer' },
              completedTransfers: { type: 'integer' },
            },
          },
          assetsByStatus: { type: 'array', items: { type: 'object' } },
          assetsByCategory: { type: 'array', items: { type: 'object' } },
          assetsByMunicipality: { type: 'array', items: { type: 'object' } },
          assetsBySchool: { type: 'array', items: { type: 'object' } },
          transfersByStatus: { type: 'array', items: { type: 'object' } },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid JWT',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Role or scope denied',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found or outside caller scope',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      ValidationError: {
        description: 'Invalid request parameters',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'Duplicate resource (unique name, email, or code)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'API and database health',
        security: [],
        responses: {
          200: {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and receive a JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke the current JWT',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logged out' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard overview (KPIs + all charts)',
        description:
          'Role-scoped. State Administrator sees national data. Municipal Officer sees assigned municipality. School Administrator sees assigned school.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard overview' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/dashboard/kpis': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard KPI cards',
        description:
          'Returns totalAssets, activeAssets, damagedAssets, underMaintenance, totalSchools, totalAssetValue, plus disposed/lost and pending/approved/completed workflow counts.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'KPI payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        totalAssets: { type: 'integer', example: 500 },
                        activeAssets: { type: 'integer', example: 352 },
                        damagedAssets: { type: 'integer', example: 58 },
                        underMaintenance: { type: 'integer', example: 48 },
                        disposedAssets: { type: 'integer', example: 25 },
                        lostAssets: { type: 'integer', example: 17 },
                        totalSchools: { type: 'integer', example: 27 },
                        totalAssetValue: { type: 'number', example: 12450000 },
                        pendingMaintenance: { type: 'integer', example: 12 },
                        completedMaintenance: { type: 'integer', example: 40 },
                        pendingTransfers: { type: 'integer', example: 3 },
                        approvedTransfers: { type: 'integer', example: 1 },
                        completedTransfers: { type: 'integer', example: 8 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/dashboard/charts/municipality': {
      get: {
        tags: ['Dashboard'],
        summary: 'Assets by municipality',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Chart series: labels, values, codes' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard/charts/school': {
      get: {
        tags: ['Dashboard'],
        summary: 'Assets by school',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Chart series: labels, values, codes' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard/charts/category': {
      get: {
        tags: ['Dashboard'],
        summary: 'Assets by category',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Chart series: labels, values, departments' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard/charts/status': {
      get: {
        tags: ['Dashboard'],
        summary: 'Asset status distribution',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Chart series: labels, values, colors' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard/charts/value-by-municipality': {
      get: {
        tags: ['Dashboard'],
        summary: 'Asset value by municipality',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Chart series: labels, values, codes' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/dashboard/charts/transfers': {
      get: {
        tags: ['Dashboard'],
        summary: 'Transfer status distribution',
        description: 'Role-scoped counts for draft, pending, approved, rejected, completed, and cancelled transfers.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Chart series: labels, values',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        labels: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Draft', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
                        },
                        values: {
                          type: 'array',
                          items: { type: 'integer' },
                          example: [0, 3, 1, 0, 8, 1],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/maintenance': {
      get: {
        tags: ['Maintenance'],
        summary: 'List maintenance requests',
        description:
          'State Administrator: all requests. Municipal Officer: assigned municipality. School Administrator: own school.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'assetId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated maintenance requests' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Maintenance'],
        summary: 'Create a maintenance request',
        description: 'School Administrator (own school) and State Administrator. Logs asset_history maintenance_requested.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['assetId', 'description'],
                properties: {
                  assetId: { type: 'string', format: 'uuid' },
                  description: { type: 'string', example: 'Projector bulb needs replacement' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
                  estimatedCost: { type: 'number', example: 3500 },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Request created' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'Open request already exists for this asset' },
        },
      },
    },
    '/maintenance/{id}': {
      get: {
        tags: ['Maintenance'],
        summary: 'Maintenance request details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Request detail' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/maintenance/{id}/approve': {
      put: {
        tags: ['Maintenance'],
        summary: 'Approve a pending request',
        description: 'Municipal Officer and State Administrator. Sets asset Active → Under Maintenance.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  assignedTo: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request approved' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/maintenance/{id}/reject': {
      put: {
        tags: ['Maintenance'],
        summary: 'Reject an open request',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rejectionReason'],
                properties: {
                  rejectionReason: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request rejected' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/maintenance/{id}/complete': {
      put: {
        tags: ['Maintenance'],
        summary: 'Mark a request as completed',
        description: 'Sets completedAt and actualCost. Restores asset Under Maintenance → Active. Logs maintenance_completed.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  actualCost: { type: 'number', example: 3200 },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request completed' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/transfers': {
      get: {
        tags: ['Transfers'],
        summary: 'List asset transfers',
        description:
          'State Administrator: all transfers. Municipal Officer: transfers where from or to school is in the assigned municipality. School Administrator: transfers related to own school.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'] } },
          { name: 'assetId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search reason, asset tag, asset name, or school name' },
        ],
        responses: {
          200: {
            description: 'Paginated transfers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Transfer' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Transfers'],
        summary: 'Create a transfer request',
        description:
          'School Administrator (own school assets) and State Administrator. Creates status pending. Logs asset_history transfer_requested. Municipal Officer cannot create transfers.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TransferCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Transfer created as pending',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Transfer' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { description: 'Asset has an active transfer or is under maintenance' },
        },
      },
    },
    '/transfers/{id}': {
      get: {
        tags: ['Transfers'],
        summary: 'Transfer details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Transfer detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Transfer' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/transfers/{id}/approve': {
      put: {
        tags: ['Transfers'],
        summary: 'Approve a pending transfer',
        description: 'Municipal Officer and State Administrator. pending → approved. Logs transfer_approved.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transfer approved' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/transfers/{id}/reject': {
      put: {
        tags: ['Transfers'],
        summary: 'Reject a pending transfer',
        description: 'Municipal Officer and State Administrator. pending → rejected. Logs transfer_rejected.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rejectionReason'],
                properties: {
                  rejectionReason: { type: 'string', example: 'Asset still required at source school' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transfer rejected' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/transfers/{id}/complete': {
      put: {
        tags: ['Transfers'],
        summary: 'Complete an approved transfer',
        description:
          'Municipal Officer and State Administrator. approved → completed. Updates asset.school_id (municipality follows the destination school). Logs transfer_completed and sets completedAt.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transfer completed' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { description: 'Asset deleted, under maintenance, or no longer at the source school' },
        },
      },
    },
    '/transfers/{id}/cancel': {
      put: {
        tags: ['Transfers'],
        summary: 'Cancel a draft or pending transfer',
        description: 'School Administrator (related school) and State Administrator. draft/pending → cancelled. Logs transfer_cancelled.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transfer cancelled' },
          400: { $ref: '#/components/responses/ValidationError' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/reports/inventory': {
      get: {
        tags: ['Reports'],
        summary: 'Inventory report',
        description:
          'Paginated row-level asset inventory. Requires reports:read. State Administrator: all assets. Municipal Officer: assigned municipality. School Administrator: assigned school. Extra municipalityId/schoolId filters cannot widen scope.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, asset tag, vendor, or location' },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'statusId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'purchaseDateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'purchaseDateTo', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'name', 'purchase_cost', 'asset_tag', 'purchase_date'], default: 'created_at' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Paginated inventory report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/InventoryReportItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/municipality': {
      get: {
        tags: ['Reports'],
        summary: 'Municipality asset report',
        description:
          'One aggregate row per municipality. Requires reports:read. State Administrator: all municipalities. Municipal Officer: assigned municipality. School Administrator: municipality of assigned school. Extra municipalityId cannot widen scope.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search municipality name or code' },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Paginated municipality report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/MunicipalityReportItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/school': {
      get: {
        tags: ['Reports'],
        summary: 'School asset report',
        description:
          'One aggregate row per school. Requires reports:read. State Administrator: all schools. Municipal Officer: schools in assigned municipality. School Administrator: assigned school. Extra municipalityId/schoolId cannot widen scope. Schools with no assets still appear with zero totals. Inactive schools are included (same as GET /schools).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search school name or school code' },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Paginated school report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/SchoolReportItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/maintenance': {
      get: {
        tags: ['Reports'],
        summary: 'Maintenance request report',
        description:
          'Paginated row-level maintenance requests. Requires reports:read. Same geographic scope as GET /maintenance (buildSchoolScope). State Administrator: all requests. Municipal Officer: requests for schools in assigned municipality. School Administrator: requests for assigned school. Extra municipalityId/schoolId/assetId filters cannot widen scope. dateFrom/dateTo filter requested_at (inclusive calendar dates). Search matches description, asset tag, or asset name. Soft-deleted assets are not extra-filtered (same as GET /maintenance). Default sort requested_at DESC.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'],
            },
          },
          {
            name: 'priority',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent', 'critical'],
            },
          },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'assetId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search description, asset tag, or asset name' },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Inclusive lower bound on requested_at (calendar date)' },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Inclusive upper bound on requested_at (calendar date)' },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['requested_at', 'approved_at', 'completed_at', 'priority', 'status', 'estimated_cost', 'actual_cost'],
              default: 'requested_at',
            },
          },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Paginated maintenance report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/MaintenanceReportItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/transfers': {
      get: {
        tags: ['Reports'],
        summary: 'Asset transfer report',
        description:
          'Paginated row-level transfers. Requires reports:read. Same geographic scope as GET /transfers (buildTransferScope). Extra municipalityId/schoolId/assetId cannot widen scope. dateFrom/dateTo filter requested_at as inclusive calendar dates. Default sort requested_at DESC.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'] },
          },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'assetId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search reason, asset tag/name, school name/code, municipality name/code' },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['requested_at', 'approved_at', 'completed_at', 'status', 'transfer_date'], default: 'requested_at' },
          },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Paginated transfer report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/TransferReportItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'Executive summary report',
        description:
          'Non-paginated dashboard-style snapshot. Requires reports:read. Same role scope as GET /dashboard. Optional municipalityId/schoolId cannot widen scope. Reuses dashboard repository aggregations.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Summary report',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/SummaryReport' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/reports/{reportType}/export': {
      get: {
        tags: ['Reports'],
        summary: 'Export a report as Excel or PDF',
        description:
          'Requires reports:read. Uses the same scoped dataset and filters as the matching JSON report. page/limit are ignored. Row-based reports are capped at 5,000 rows (400 if exceeded). Filenames are server-generated (sams-{type}-YYYY-MM-DD.xlsx|pdf).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'reportType',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['inventory', 'municipality', 'school', 'maintenance', 'transfers', 'summary'] },
          },
          {
            name: 'format',
            in: 'query',
            required: true,
            schema: { type: 'string', enum: ['xlsx', 'pdf'] },
          },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'assetId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: {
            description: 'Binary workbook or PDF',
            content: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                schema: { type: 'string', format: 'binary' },
              },
              'application/pdf': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/provinces': {
      get: {
        tags: ['Provinces'],
        summary: 'List provinces',
        description:
          'State Administrator only. Permission: municipalities:read. Returns all provinces with municipality counts. No pagination.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Province list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Province' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/provinces/{id}': {
      get: {
        tags: ['Provinces'],
        summary: 'Province details',
        description: 'State Administrator only. Permission: municipalities:read.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Province detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Province' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List asset categories',
        description:
          'Permission: categories:read. Global catalog (not geographically scoped). assetCount excludes soft-deleted assets.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'department', in: 'query', schema: { type: 'string' }, description: 'Filter by department (case-insensitive)' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, department, or description' },
        ],
        responses: {
          200: {
            description: 'Category list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create an asset category',
        description: 'State Administrator only. Permission: categories:write. Duplicate names return 409.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'department'],
                properties: {
                  name: { type: 'string', example: 'Desks' },
                  department: { type: 'string', example: 'Classroom Assets' },
                  description: { type: 'string', nullable: true, example: 'Student and teacher desks' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Category created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Update an asset category',
        description:
          'State Administrator only. Permission: categories:write. Deactivate with isActive=false. Never hard-deletes. Duplicate names return 409.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  department: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Category updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/statuses': {
      get: {
        tags: ['Statuses'],
        summary: 'List asset statuses',
        description: 'All authenticated users. Read-only lookup sorted by sortOrder ascending.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Status list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Status' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/municipalities': {
      get: {
        tags: ['Municipalities'],
        summary: 'List municipalities',
        description:
          'State Administrator sees all municipalities. Municipal Officer sees only the assigned municipality. School Administrator is forbidden.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'provinceId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, code, or district' },
        ],
        responses: {
          200: {
            description: 'Paginated municipality list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Municipality' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Municipalities'],
        summary: 'Create a municipality',
        description: 'State Administrator only. Permission: municipalities:write. Duplicate name or code returns 409. Never hard-deletes.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/MunicipalityCreate' } },
          },
        },
        responses: {
          201: {
            description: 'Municipality created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Municipality' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/municipalities/{id}': {
      get: {
        tags: ['Municipalities'],
        summary: 'Municipality details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Municipality detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Municipality' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Municipalities'],
        summary: 'Update a municipality',
        description: 'State Administrator only. Permission: municipalities:write. Deactivate with isActive=false.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/MunicipalityUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'Municipality updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Municipality' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/schools': {
      get: {
        tags: ['Schools'],
        summary: 'List, search, and filter schools',
        description:
          'State Administrator: all schools. Municipal Officer: schools in assigned municipality. School Administrator: own school only. Search matches name and school code. Filter with municipalityId.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search school name or school code' },
          { name: 'schoolType', in: 'query', schema: { type: 'string', example: 'Secondary' } },
        ],
        responses: {
          200: {
            description: 'Paginated school list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/SchoolListItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Schools'],
        summary: 'Create a school',
        description: 'State Administrator only. Permission: schools:write. Duplicate schoolCode returns 409.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SchoolCreate' } },
          },
        },
        responses: {
          201: {
            description: 'School created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/SchoolDetail' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/schools/{id}/assets': {
      get: {
        tags: ['Schools'],
        summary: 'List assets for a school',
        description:
          'Thin alias of GET /assets with schoolId taken from the path. Permission: assets:read. School outside caller scope returns 404. Query schoolId cannot widen access.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'statusId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'name', 'purchase_cost', 'asset_tag', 'purchase_date'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          200: {
            description: 'Paginated asset list for the school',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/schools/{id}': {
      get: {
        tags: ['Schools'],
        summary: 'School details with asset stats',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'School detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/SchoolDetail' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Schools'],
        summary: 'Update a school',
        description: 'State Administrator only. Permission: schools:write. Deactivate with isActive=false.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SchoolUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'School updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/SchoolDetail' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'State Administrator only. Permission: users:read. password_hash is never returned.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['state_admin', 'municipal_officer', 'school_admin'] } },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Paginated user list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        description:
          'State Administrator only. Permission: users:write. Role assignment: state_admin has no municipality/school; municipal_officer requires municipalityId; school_admin requires schoolId (municipality derived if omitted). Duplicate email returns 409.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } },
          },
        },
        responses: {
          201: {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'User details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'User detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update a user',
        description: 'State Administrator only. Password updates are re-hashed. Self-deactivation and last active state_admin protection apply.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Deactivate a user',
        description: 'Soft deactivate (is_active = false). Does not delete the row. Rejects self-deactivation (400) and last active state_admin (409).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'User deactivated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        isActive: { type: 'boolean', example: false },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/assets': {
      get: {
        tags: ['Assets'],
        summary: 'List, search, filter, and sort assets',
        description:
          'State Administrator: all assets. Municipal Officer: assets in assigned municipality. School Administrator: assets in assigned school. Soft-deleted assets are excluded.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, asset tag, vendor, or location' },
          { name: 'municipalityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'schoolId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'statusId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'purchaseDateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'purchaseDateTo', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['created_at', 'name', 'purchase_cost', 'asset_tag', 'purchase_date'], default: 'created_at' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: 'Paginated asset list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Asset' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Assets'],
        summary: 'Register an asset',
        description:
          'Auto-generates assetTag (SAMS-{MUN}-{YEAR}-{SEQ}) and qrCode. State Administrator and School Administrator (own school) only. Logs asset_history created.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Asset created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Asset' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/assets/verify/{tag}': {
      get: {
        tags: ['Assets'],
        summary: 'Public QR verification',
        security: [],
        parameters: [
          { name: 'tag', in: 'path', required: true, schema: { type: 'string', example: 'SAMS-BTW-2026-0001' } },
        ],
        responses: {
          200: { description: 'Verified public asset summary' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/assets/{id}': {
      get: {
        tags: ['Assets'],
        summary: 'Asset details with recent history',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Asset detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Asset' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Assets'],
        summary: 'Update an asset',
        description: 'Partial update. Field changes are written to asset_history. Status changes are logged as status_changed.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssetCreateRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Asset updated' },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Assets'],
        summary: 'Soft delete an asset',
        description: 'Sets deleted_at. State Administrator and School Administrator (own school) only. Logs asset_history deleted.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Asset soft deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/assets/{id}/history': {
      get: {
        tags: ['Assets'],
        summary: 'Asset history log',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Paginated history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/AssetHistoryItem' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/assets/{id}/qr': {
      get: {
        tags: ['Assets'],
        summary: 'QR payload for an asset',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'QR verification payload' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};

module.exports = spec;
