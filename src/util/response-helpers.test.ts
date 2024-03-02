import { describe, expect, it } from 'vitest';
import { EmbedType, responseEmbed } from './response-helpers.js';

describe('responseEmbed()', () => {
	it('should prepend the correct emoji', () => {
		expect(responseEmbed(EmbedType.Info, 'foo').title).toBe('📄	foo');
		expect(responseEmbed(EmbedType.Error, 'foo').title).toBe('❌	foo');
		expect(responseEmbed(EmbedType.Success, 'foo').title).toBe('✅	foo');
		expect(responseEmbed(EmbedType.Prompt, 'foo').title).toBe('❓	foo');
		expect(responseEmbed(EmbedType.None, 'foo').title).toBe('foo');
	});

	it('should set the correct color if not explicitly set', () => {
		expect(responseEmbed(EmbedType.Info, 'foo').color).toBe(0x00_99_ff);
		expect(responseEmbed(EmbedType.Error, 'foo').color).toBe(0xff_00_00);
		expect(responseEmbed(EmbedType.Success, 'foo').color).toBe(0x00_ff_00);
		expect(responseEmbed(EmbedType.Prompt, 'foo').color).toBe(0xff_a5_00);

		expect(responseEmbed(EmbedType.None, 'foo').color).toBeUndefined();
	});

	it('should not modify the color if explicity set in options', () => {
		expect(responseEmbed(EmbedType.Info, 'foo', { color: 0xee_ff_ff }).color).toBe(0xee_ff_ff);
	});
});
