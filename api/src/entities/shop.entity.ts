import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names';

@Entity({ name: TableNames.Shops })
export class Shop {
	@PrimaryGeneratedColumn({ name: 'Id' })
	id: number

	@Column({ name: 'ShopDomain', unique: true })
	shopDomain: string

	// TODO: Encrypt this column offline? 
	@Column({ name: 'AccessToken' })
	accessToken: string

	@Column({ name: 'Scopes' })
	scopes: string

	@Column({ name: 'IsActive' })
	isActive: boolean

	@Column({ name: 'InstalledAt', type: 'timestamp' })
	installedAt: Date

	@Column({ name: 'UninstalledAt', type: 'timestamp', nullable: true })
	uninstalledAt: Date | null

	@Column({ name: 'UpdatedAt', type: 'timestamp' })
	updatedAt: Date
}