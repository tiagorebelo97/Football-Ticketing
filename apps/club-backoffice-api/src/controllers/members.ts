import { Request, Response } from 'express';
import pool from '../db';
import * as XLSX from 'xlsx';

// List all members for a club with optional filters
export const listMembers = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    const { status, memberType, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT 
        cm.*,
        u.email as user_email,
        COALESCE(
          (SELECT COUNT(*) FROM member_quotas mq 
           WHERE mq.member_id = cm.id AND mq.status = 'paid'),
          0
        ) as paid_quotas,
        COALESCE(
          (SELECT COUNT(*) FROM member_quotas mq 
           WHERE mq.member_id = cm.id AND mq.status = 'overdue'),
          0
        ) as overdue_quotas
      FROM club_members cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.club_id = $1
    `;
    
    const params: any[] = [clubId];
    let paramIndex = 2;

    if (status) {
      query += ` AND cm.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (memberType) {
      query += ` AND cm.member_type = $${paramIndex}`;
      params.push(memberType);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        cm.first_name ILIKE $${paramIndex} OR 
        cm.last_name ILIKE $${paramIndex} OR 
        cm.email ILIKE $${paramIndex} OR
        cm.member_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY cm.created_at DESC`;

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM club_members WHERE club_id = $1';
    const countParams = [clubId];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      members: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error listing members:', error);
    res.status(500).json({ error: 'Failed to list members' });
  }
};

// Get a single member by ID
export const getMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT cm.*, u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
       FROM club_members cm
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE cm.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting member:', error);
    res.status(500).json({ error: 'Failed to get member' });
  }
};

// Create a new member
export const createMember = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    const {
      member_number,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      postal_code,
      country,
      member_since,
      status,
      member_type,
      quota_amount,
      quota_frequency,
      notes,
      user_id
    } = req.body;

    // Validate required fields
    if (!member_number || !first_name || !last_name || !email || !member_since) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO club_members (
        club_id, member_number, first_name, last_name, email, phone,
        date_of_birth, address, city, postal_code, country, member_since,
        status, member_type, quota_amount, quota_frequency, notes, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        clubId, member_number, first_name, last_name, email, phone,
        date_of_birth, address, city, postal_code, country, member_since,
        status || 'active', member_type || 'regular', quota_amount || 0, 
        quota_frequency || 'monthly', notes, user_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Member number or email already exists for this club' });
    } else {
      res.status(500).json({ error: 'Failed to create member' });
    }
  }
};

// Update a member
export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      member_number,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      postal_code,
      country,
      member_since,
      status,
      member_type,
      quota_amount,
      quota_frequency,
      notes,
      user_id
    } = req.body;

    const result = await pool.query(
      `UPDATE club_members SET
        member_number = COALESCE($1, member_number),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        date_of_birth = COALESCE($6, date_of_birth),
        address = COALESCE($7, address),
        city = COALESCE($8, city),
        postal_code = COALESCE($9, postal_code),
        country = COALESCE($10, country),
        member_since = COALESCE($11, member_since),
        status = COALESCE($12, status),
        member_type = COALESCE($13, member_type),
        quota_amount = COALESCE($14, quota_amount),
        quota_frequency = COALESCE($15, quota_frequency),
        notes = COALESCE($16, notes),
        user_id = COALESCE($17, user_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *`,
      [
        member_number, first_name, last_name, email, phone,
        date_of_birth, address, city, postal_code, country, member_since,
        status, member_type, quota_amount, quota_frequency, notes, user_id, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating member:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Member number or email already exists for this club' });
    } else {
      res.status(500).json({ error: 'Failed to update member' });
    }
  }
};

// Delete (deactivate) a member
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE club_members SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deactivated successfully', member: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};

// Get member quota history
export const getMemberQuotas = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT mq.*, u.first_name || ' ' || u.last_name as recorded_by
       FROM member_quotas mq
       LEFT JOIN users u ON mq.recorded_by_user_id = u.id
       WHERE mq.member_id = $1
       ORDER BY mq.payment_date DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error getting member quotas:', error);
    res.status(500).json({ error: 'Failed to get member quotas' });
  }
};

// Register a quota payment
export const createQuotaPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // member id
    const {
      amount,
      payment_date,
      period_start,
      period_end,
      payment_method,
      status,
      reference,
      notes,
      recorded_by_user_id
    } = req.body;

    // Validate required fields
    if (!amount || !payment_date || !period_start || !period_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get member's club_id
    const memberResult = await pool.query(
      'SELECT club_id FROM club_members WHERE id = $1',
      [id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const clubId = memberResult.rows[0].club_id;

    const result = await pool.query(
      `INSERT INTO member_quotas (
        member_id, club_id, amount, payment_date, period_start, period_end,
        payment_method, status, reference, notes, recorded_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id, clubId, amount, payment_date, period_start, period_end,
        payment_method, status || 'paid', reference, notes, recorded_by_user_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating quota payment:', error);
    res.status(500).json({ error: 'Failed to create quota payment' });
  }
};

// Import members from Excel
export const importMembersFromExcel = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      try {
        // Map Excel columns to database fields (flexible column names)
        const memberData = {
          member_number: row['Member Number'] || row['member_number'] || row['Número de Sócio'] || `AUTO-${Date.now()}-${i}`,
          first_name: row['First Name'] || row['first_name'] || row['Nome'] || '',
          last_name: row['Last Name'] || row['last_name'] || row['Apelido'] || '',
          email: row['Email'] || row['email'] || row['E-mail'] || '',
          phone: row['Phone'] || row['phone'] || row['Telefone'] || null,
          date_of_birth: row['Date of Birth'] || row['date_of_birth'] || row['Data de Nascimento'] || null,
          address: row['Address'] || row['address'] || row['Morada'] || null,
          city: row['City'] || row['city'] || row['Cidade'] || null,
          postal_code: row['Postal Code'] || row['postal_code'] || row['Código Postal'] || null,
          country: row['Country'] || row['country'] || row['País'] || null,
          member_since: row['Member Since'] || row['member_since'] || row['Sócio Desde'] || new Date().toISOString().split('T')[0],
          status: row['Status'] || row['status'] || 'active',
          member_type: row['Member Type'] || row['member_type'] || row['Tipo de Sócio'] || 'regular',
          quota_amount: parseFloat(row['Quota Amount'] || row['quota_amount'] || row['Quota'] || '0'),
          quota_frequency: row['Quota Frequency'] || row['quota_frequency'] || row['Frequência de Quota'] || 'monthly',
          notes: row['Notes'] || row['notes'] || row['Notas'] || null
        };

        // Validate required fields
        if (!memberData.first_name || !memberData.last_name || !memberData.email) {
          results.errors.push({ row: i + 1, error: 'Missing required fields', data: row });
          results.failed++;
          continue;
        }

        // Insert member
        await pool.query(
          `INSERT INTO club_members (
            club_id, member_number, first_name, last_name, email, phone,
            date_of_birth, address, city, postal_code, country, member_since,
            status, member_type, quota_amount, quota_frequency, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (club_id, member_number) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = CURRENT_TIMESTAMP`,
          [
            clubId,
            memberData.member_number,
            memberData.first_name,
            memberData.last_name,
            memberData.email,
            memberData.phone,
            memberData.date_of_birth,
            memberData.address,
            memberData.city,
            memberData.postal_code,
            memberData.country,
            memberData.member_since,
            memberData.status,
            memberData.member_type,
            memberData.quota_amount,
            memberData.quota_frequency,
            memberData.notes
          ]
        );

        results.success++;
      } catch (error: any) {
        results.errors.push({ row: i + 1, error: error.message, data: row });
        results.failed++;
      }
    }

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error: any) {
    console.error('Error importing members:', error);
    res.status(500).json({ error: 'Failed to import members' });
  }
};

// Get member statistics for a club
export const getMemberStats = async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;

    const statsQuery = await pool.query(
      `SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE status = 'active') as active_members,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_members,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_members,
        COUNT(*) FILTER (WHERE member_type = 'regular') as regular_members,
        COUNT(*) FILTER (WHERE member_type = 'premium') as premium_members,
        COUNT(*) FILTER (WHERE member_type = 'vip') as vip_members
       FROM club_members
       WHERE club_id = $1`,
      [clubId]
    );

    const quotaStatsQuery = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'paid') as paid_quotas,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_quotas,
        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as total_revenue
       FROM member_quotas
       WHERE club_id = $1`,
      [clubId]
    );

    res.json({
      members: statsQuery.rows[0],
      quotas: quotaStatsQuery.rows[0]
    });
  } catch (error: any) {
    console.error('Error getting member stats:', error);
    res.status(500).json({ error: 'Failed to get member statistics' });
  }
};
