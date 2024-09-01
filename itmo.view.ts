namespace $.$$ {
	
	export class $my_itmo extends $.$my_itmo {
		
		@ $mol_mem
		data() {
			return $my_itmo_data( this.$.$mol_fetch.json( 'my/itmo/itmo_data.json' ) as any )
		}
		
		@ $mol_mem
		buildings_data() {
			const data = Object.fromEntries(
				Object.values( this.data().flow )
				.flatMap( flow => flow.variants )
				.map( les => [ les.bld_id, {
					id: les.bld_id,
					name: les.building,
					main_bld_id: les.main_bld_id,
					code: '💻',
				} ] )
			)
			const codes = [ 'БА', 'КА', 'ЧА', 'ЛА', 'ЛБ', 'ЛЕ', 'ЛМ', 'ОЛ' ] // '¹²³⁴⁵⁶⁷⁸⁹'
			Object.values( data ).forEach( ( bld: any, i )=> {
				bld.name = ( bld.code = codes[ i ] ) + ': ' + ( bld.name ?? 'Онлайн' )
			} )
			return data
		}
		
		@ $mol_mem
		buildings() {
			return Object.keys( this.buildings_data() ).map( id => this.Building( id ) )
		}
		
		building_title( id: string ) {
			return this.buildings_data()[ id ].name
		}
		
		@ $mol_mem
		slots_data() {
			return $mol_array_groups(
				Object.values( this.data().flow ),
				flow => ( flow.variants[0]?.date ?? '' ) + 'T' + ( flow.variants[0]?.time_start ?? '' )
			)
		}
		
		@ $mol_mem
		days_data() {
			return $mol_array_groups( Object.keys( this.slots_data() ).sort(), slot => slot.slice( 0, 10 ) )
		}
		
		@ $mol_mem
		days() {
			return Object.keys( this.days_data() ).sort().flatMap( day => day === 'T' ? [] : [ this.Day( day ) ] )
		}
		
		@ $mol_mem_key
		day_title( day: string ) {
			return new $mol_time_moment( day ).toString( 'DD Mon' )
		}
		
		@ $mol_mem_key
		day_slots( day: string ) {
			return this.days_data()[ day ]!.map( slot => this.Slot( slot ) )
		}
		
		@ $mol_mem
		slots() {
			return Object.keys( this.slots_data() ).map( slot => this.Slot( slot ) )
		}
		
		slot_time( slot: string ) {
			return new $mol_time_moment( slot ).toString( 'hh:mm' )
		}
		
		@ $mol_mem_key
		slot_options( slot: string ) {
			const options = Object.fromEntries( this.slots_data()[ slot ]!.map(
				les => [
					les.discipline_id,
					( this.discipline_slot( les.discipline_id + '' ) ? '✅' : '💤' )
					+ ' '  + this.buildings_data()[ les.variants[0].bld_id + '' ].code
					+ ': ' + this.data().discipline[ les.discipline_id ].name,
				]
			) )
			options[''] = '💤'
			return options
		}
		
		@ $mol_mem
		local() {
			return this.$.$mol_store_local.sub( '$my_itmo_schedule', new $mol_store( {} as Record< string, string | null > ) )
		}
		
		slot_value( slot: string, next?: string ) {
			if( next !== undefined ) {
				const old = this.discipline_slot( next )
				if( old ) this.local().value( old, null )
			}
			return this.local().value( slot, next ) ?? ''
		}
		
		@ $mol_mem
		disciplines_slot() {
			return Object.fromEntries( Object.keys( this.slots_data() ).map( slot => [ this.slot_value( slot ) ?? '', slot ] ) )
		}
		
		@ $mol_mem
		disciplines_rows() {
			return Object.keys( this.data().discipline )
				.filter( $mol_match_text( this.disciplines_query(), id => [ this.discipline_title( id ) ]) )
				.map( id => this.Discipline( id ) )
		}
		
		discipline_title( id: string ) {
			return this.data().discipline[ id ].name
		}
		
		discipline_descr( id: string ) {
			return this.data().discipline[ id ].description
		}
		
		discipline_arg( id: string ) {
			return { discipline: id }
		}
		
		discipline_slot( id: string, next?: string ) {
			if( next !== undefined ) this.slot_value( next, id )
			return this.disciplines_slot()[ id ] ?? ''
		}
		
		@ $mol_mem_key
		discipline_slot_options( id: string ) {
			const data = this.data()
			const slots = data.discipline[ id ].variants
				.map( flow_id => data.flow[ flow_id ].variants[0] )
				.map( les => ( les.date ?? '' ) + 'T' + ( les.time_start ?? '' ) )
			return [ ... new Set( slots ) ].sort()
		}
		
		@ $mol_mem_key
		discipline_slot_title( slot: string ) {
			return ( this.slot_value( slot ) ? '🔵 ' : '🟢 ' )
				+ new $mol_time_moment( slot ).toString( 'DD Mon hh:mm' )
		}
		
		@ $mol_mem
		discipline_current() {
			return this.$.$mol_state_arg.value( 'discipline' ) ?? null
		}
		
		@ $mol_mem
		pages_dynamic() {
			return [
				... this.discipline_current() ? [ this.Discipline_page( this.discipline_current() ) ] : []
			]
		}
		
		dump() {
			return this.data()
		}
		
	}
}
