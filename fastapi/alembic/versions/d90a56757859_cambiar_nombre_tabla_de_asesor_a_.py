"""cambiar_nombre_tabla_de_asesor_a_asesores

Revision ID: d90a56757859
Revises: 337ec13a07eb
Create Date: 2026-07-25 01:03:38.035919

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd90a56757859'
down_revision: Union[str, Sequence[str], None] = '337ec13a07eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.drop_constraint(op.f('leads_asesor_encargado_fkey'), 'leads', type_='foreignkey')
    op.drop_table('asesor')    
    op.create_table('asesores',
        sa.Column('id_asesor', sa.Uuid(), nullable=False),
        sa.Column('nombre_asesor', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint('id_asesor')
    )
    
    op.create_foreign_key(None, 'leads', 'asesores', ['asesor_encargado'], ['id_asesor'])


def downgrade() -> None:
    op.drop_constraint(None, 'leads', type_='foreignkey')
    
    op.drop_table('asesores')
    
    op.create_table('asesor',
        sa.Column('id_asesor', sa.UUID(), autoincrement=False, nullable=False),
        sa.Column('nombre_asesor', sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint('id_asesor', name=op.f('asesor_pkey'))
    )
    
    op.create_foreign_key(op.f('leads_asesor_encargado_fkey'), 'leads', 'asesor', ['asesor_encargado'], ['id_asesor'])
