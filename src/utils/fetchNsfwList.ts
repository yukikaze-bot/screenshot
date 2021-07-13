import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { redis } from '..';

export const fetchNsfwList = async () => {
	const inCache = await redis.get('nsfwList').catch(() => null);

	if (inCache)
		return inCache
			.split('\n')
			.filter((site) => site && !site.startsWith('#'))
			.map((site) => site.replace(/^(0.0.0.0 )/, ''));

	const text = (await fetch('https://blocklistproject.github.io/Lists/alt-version/porn-nl.txt', FetchResultTypes.Text))
		.split('\n')
		.filter((site) => site && !site.startsWith('#'))
		.map((site) => site.replace(/^(0.0.0.0 )/, ''));

	return text;
};
