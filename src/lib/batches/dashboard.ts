import {
	BATCH_STATUS_DESCRIPTIONS,
	BATCH_STATUS_LABELS,
	BATCH_STATUS_ORDER
} from '$lib/batches/config';
import { estimateAbv } from '$lib/math/brewing';
import type { RecipeEngineSummary } from '$lib/math/recipe-engine';
import type { RecipeDefinition } from '$lib/recipes/domain';
import type { BatchActivityRecord, BatchDetail, BatchStatus } from '$lib/server/batches';

type DashboardTask = {
	id: string;
	label: string;
	detail: string;
	done: boolean;
	tone?: 'default' | 'warning';
};

type DashboardAlert = {
	id: string;
	message: string;
	tone: 'warning' | 'info';
};

type DashboardTimelineItem = {
	id: string;
	at: Date;
	title: string;
	detail: string;
	tone: 'default' | 'warning' | 'success';
};

type DashboardChartPoint = {
	recordedAt: Date;
	gravity: number | null;
	temperatureC: number | null;
};

type DashboardPhaseItem = {
	status: BatchStatus;
	label: string;
	state: 'complete' | 'current' | 'upcoming';
};

export type BatchDashboardState = {
	hero: {
		statusLabel: string;
		statusDescription: string;
		dayLabel: string;
		recipeStep: string;
		nextAction: string;
		progressPct: number;
	};
	metrics: {
		currentGravity: number | null;
		gravityTrend: 'up' | 'down' | 'steady';
		currentTemperatureC: number | null;
		temperatureTrend: 'up' | 'down' | 'steady';
		estimatedAbvPct: number | null;
	};
	summary: {
		originalGravity: number | null;
		targetFinalGravity: number | null;
		currentGravity: number | null;
		estimatedAbvPct: number | null;
		attenuationPct: number | null;
		daysElapsed: number;
	};
	phaseProgress: DashboardPhaseItem[];
	tasks: DashboardTask[];
	alerts: DashboardAlert[];
	timeline: DashboardTimelineItem[];
	chart: {
		points: DashboardChartPoint[];
		hasData: boolean;
	};
};

function round(value: number, decimals: number) {
	return Number(value.toFixed(decimals));
}

function numericValue(value: string | number | null | undefined) {
	if (value == null || value === '') {
		return null;
	}

	const parsed = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function daysSince(start: Date | null | undefined, now: Date) {
	if (!start) {
		return 0;
	}

	return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
}

function trendFromValues(current: number | null, previous: number | null, threshold: number) {
	if (current == null || previous == null) {
		return 'steady' as const;
	}

	if (current > previous + threshold) {
		return 'up' as const;
	}

	if (current < previous - threshold) {
		return 'down' as const;
	}

	return 'steady' as const;
}

function batchDayLabel(status: BatchStatus, daysElapsed: number) {
	if (status === 'draft') {
		return 'Planning';
	}

	return `Day ${daysElapsed + 1}`;
}

function phaseRecipeStep(status: BatchStatus) {
	switch (status) {
		case 'draft':
			return 'Pre-brew planning';
		case 'brewing':
			return 'Brew day execution';
		case 'fermenting':
			return 'Primary fermentation';
		case 'conditioning':
			return 'Conditioning and packaging prep';
		case 'finished':
			return 'Batch complete';
	}
}

function dryHopTask(daysElapsed: number, hasDryHop: boolean) {
	if (!hasDryHop) {
		return null;
	}

	const targetDay = 4;
	const daysUntil = targetDay - (daysElapsed + 1);

	if (daysUntil > 1) {
		return {
			id: 'dry-hop',
			label: `Dry hop in ${daysUntil} days`,
			detail: 'This recipe includes dry hop additions during fermentation.',
			done: false
		} satisfies DashboardTask;
	}

	if (daysUntil === 1) {
		return {
			id: 'dry-hop',
			label: 'Dry hop tomorrow',
			detail: 'This recipe includes dry hop additions during fermentation.',
			done: false
		} satisfies DashboardTask;
	}

	return {
		id: 'dry-hop',
		label: 'Dry hop now',
		detail: 'This recipe includes dry hop additions during fermentation.',
		done: false,
		tone: 'warning'
	} satisfies DashboardTask;
}

function buildTasks(params: {
	status: BatchStatus;
	daysElapsed: number;
	telemetryCount: number;
	lastReadingAt: Date | null;
	yeastMinC: number | null;
	yeastMaxC: number | null;
	hasDryHop: boolean;
	hasPackagingAdditions: boolean;
}) {
	const tasks: DashboardTask[] = [];

	if (params.status === 'draft') {
		tasks.push({
			id: 'confirm-brew-day',
			label: 'Confirm brew day and batch size',
			detail: 'Lock in brew date, target volume, and brew log notes before you start.',
			done: false
		});
		tasks.push({
			id: 'review-recipe',
			label: 'Review recipe targets',
			detail: 'Check original gravity, final gravity, and ingredient plan one more time.',
			done: false
		});
	}

	if (params.status === 'brewing') {
		tasks.push({
			id: 'record-og',
			label: 'Record original gravity',
			detail: 'Capture brew-day gravity once wort is ready for fermentation.',
			done: params.telemetryCount > 0
		});
		tasks.push({
			id: 'pitch-yeast',
			label: 'Pitch yeast',
			detail: 'Move to fermenting once yeast is pitched and the batch is transferred.',
			done: false
		});
	}

	if (params.status === 'fermenting') {
		if (params.yeastMinC != null && params.yeastMaxC != null) {
			tasks.push({
				id: 'temp-band',
				label: `Keep temp ${round(params.yeastMinC, 0)}-${round(params.yeastMaxC, 0)}°C`,
				detail: 'Stay inside the recommended fermentation range for the selected yeast.',
				done: false
			});
		}

		const needsReading =
			!params.lastReadingAt || Date.now() - params.lastReadingAt.getTime() > 86_400_000;
		tasks.push({
			id: 'take-reading',
			label: 'Take gravity reading',
			detail: 'Log a fresh reading to keep fermentation progress current.',
			done: !needsReading
		});

		const dryHop = dryHopTask(params.daysElapsed, params.hasDryHop);
		if (dryHop) {
			tasks.push(dryHop);
		}
	}

	if (params.status === 'conditioning') {
		tasks.push({
			id: 'confirm-stable-gravity',
			label: 'Confirm stable final gravity',
			detail: 'Make sure gravity has settled before packaging or serving.',
			done: params.telemetryCount >= 2
		});

		if (params.hasPackagingAdditions) {
			tasks.push({
				id: 'packaging-additions',
				label: 'Prepare packaging additions',
				detail: 'This recipe includes conditioning or packaging phase additions.',
				done: false
			});
		}
	}

	if (params.status === 'finished') {
		tasks.push({
			id: 'close-out',
			label: 'Capture final notes',
			detail: 'Record outcome, packaging details, and anything to improve next time.',
			done: false
		});
	}

	return tasks.slice(0, 3);
}

function buildAlerts(params: {
	status: BatchStatus;
	currentGravity: number | null;
	targetFinalGravity: number | null;
	currentTemperatureC: number | null;
	yeastMinC: number | null;
	yeastMaxC: number | null;
	telemetryCount: number;
}) {
	const alerts: DashboardAlert[] = [];

	if (
		params.currentTemperatureC != null &&
		params.yeastMaxC != null &&
		params.currentTemperatureC > params.yeastMaxC
	) {
		alerts.push({
			id: 'temp-high',
			message: 'Temperature is slightly above the recommended yeast range.',
			tone: 'warning'
		});
	}

	if (
		params.currentTemperatureC != null &&
		params.yeastMinC != null &&
		params.currentTemperatureC < params.yeastMinC
	) {
		alerts.push({
			id: 'temp-low',
			message: 'Temperature is below the recommended yeast range.',
			tone: 'warning'
		});
	}

	if (params.telemetryCount > 0 && (params.status === 'draft' || params.status === 'brewing')) {
		alerts.push({
			id: 'phase-mismatch-fermentation-data',
			message: 'This batch has fermentation readings but is still in an earlier phase.',
			tone: 'warning'
		});
	}

	if (
		params.status === 'conditioning' &&
		params.currentGravity != null &&
		params.targetFinalGravity != null &&
		params.currentGravity > params.targetFinalGravity + 0.004
	) {
		alerts.push({
			id: 'conditioning-high-gravity',
			message: 'Current gravity is still above the recipe target for conditioning.',
			tone: 'warning'
		});
	}

	if (params.status === 'finished' && params.currentGravity == null) {
		alerts.push({
			id: 'finished-without-final-gravity',
			message: 'This batch is finished but does not have a logged final gravity reading.',
			tone: 'info'
		});
	}

	return alerts;
}

function parseAuditValue(
	payload: Record<string, unknown> | null | undefined,
	key: string,
	fallbackKey?: string
) {
	const value = payload?.[key] ?? (fallbackKey ? payload?.[fallbackKey] : undefined);
	return typeof value === 'string' ? value : null;
}

function buildTimeline(
	batch: BatchDetail,
	activity: BatchActivityRecord[]
): DashboardTimelineItem[] {
	const items: DashboardTimelineItem[] = [];

	for (const log of activity) {
		if (log.tableName === 'batches' && log.action === 'update') {
			const oldStatus = parseAuditValue(log.oldData, 'status');
			const newStatus = parseAuditValue(log.newData, 'status');

			if (oldStatus && newStatus && oldStatus !== newStatus) {
				items.push({
					id: log.id,
					at: log.createdAt,
					title: 'Phase changed',
					detail: `${BATCH_STATUS_LABELS[oldStatus as BatchStatus]} -> ${BATCH_STATUS_LABELS[newStatus as BatchStatus]}`,
					tone: 'success'
				});
			}
		}

		if (log.tableName === 'batch_telemetry' && log.action === 'insert') {
			const gravity = parseAuditValue(log.newData, 'gravity');
			const temperatureC = parseAuditValue(log.newData, 'temperatureC', 'temperature_c');
			const notes = parseAuditValue(log.newData, 'notes');
			const parts = [
				gravity ? `Gravity ${gravity}` : null,
				temperatureC ? `Temp ${temperatureC}°C` : null,
				notes
			].filter((value): value is string => Boolean(value));

			items.push({
				id: log.id,
				at: log.createdAt,
				title: 'Reading added',
				detail: parts.join(', '),
				tone: 'default'
			});
		}
	}

	if (batch.brewDate) {
		const originalReading = batch.telemetry
			.slice()
			.sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime())
			.find((entry) => entry.gravity != null);

		items.push({
			id: 'brew-day',
			at: batch.brewDate,
			title: 'Brewed',
			detail: originalReading?.gravity ? `OG ${originalReading.gravity}` : 'Batch log started',
			tone: 'success'
		});
	}

	if (batch.notes) {
		items.push({
			id: 'batch-notes',
			at: batch.updatedAt,
			title: 'Batch notes updated',
			detail: batch.notes,
			tone: 'default'
		});
	}

	return items.sort((left, right) => right.at.getTime() - left.at.getTime()).slice(0, 8);
}

export function buildBatchDashboardState(params: {
	batch: BatchDetail;
	definition: RecipeDefinition;
	engineSummary: RecipeEngineSummary;
	activity: BatchActivityRecord[];
	now?: Date;
}) {
	const now = params.now ?? new Date();
	const points = [...params.batch.telemetry]
		.sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime())
		.map((entry) => ({
			recordedAt: entry.recordedAt,
			gravity: numericValue(entry.gravity),
			temperatureC: numericValue(entry.temperatureC)
		}));
	const latest = points.at(-1) ?? null;
	const previous = points.at(-2) ?? null;
	const originalGravity =
		points.find((point) => point.gravity != null)?.gravity ??
		params.engineSummary.computed.og ??
		null;
	const currentGravity = latest?.gravity ?? null;
	const currentTemperatureC = latest?.temperatureC ?? null;
	const targetFinalGravity =
		params.engineSummary.targets.fg ?? params.engineSummary.computed.fg ?? null;
	const estimatedAbvPct =
		originalGravity != null && currentGravity != null
			? round(estimateAbv(originalGravity, currentGravity), 2)
			: params.engineSummary.computed.abvPct;
	const attenuationPct =
		originalGravity != null && currentGravity != null && originalGravity > 1
			? round(((originalGravity - currentGravity) / (originalGravity - 1)) * 100, 1)
			: null;
	const daysElapsed = daysSince(
		params.batch.brewDate ?? params.batch.startedAt ?? params.batch.createdAt,
		now
	);
	const yeastTemps = params.definition.yeasts
		.map((item) => ({
			min: numericValue(item.minTemperatureC),
			max: numericValue(item.maxTemperatureC)
		}))
		.filter((item) => item.min != null || item.max != null);
	const yeastMinC =
		yeastTemps.length > 0
			? Math.min(...yeastTemps.map((item) => item.min ?? Number.POSITIVE_INFINITY))
			: null;
	const yeastMaxC =
		yeastTemps.length > 0
			? Math.max(...yeastTemps.map((item) => item.max ?? Number.NEGATIVE_INFINITY))
			: null;
	const hasDryHop = params.definition.hops.some((item) => item.usePhase === 'dry_hop');
	const hasPackagingAdditions = params.definition.miscs.some(
		(item) => item.usePhase === 'packaging'
	);
	const tasks = buildTasks({
		status: params.batch.status,
		daysElapsed,
		telemetryCount: params.batch.telemetry.length,
		lastReadingAt: latest?.recordedAt ?? null,
		yeastMinC: Number.isFinite(yeastMinC ?? NaN) ? yeastMinC : null,
		yeastMaxC: Number.isFinite(yeastMaxC ?? NaN) ? yeastMaxC : null,
		hasDryHop,
		hasPackagingAdditions
	});
	const phaseIndex = BATCH_STATUS_ORDER.indexOf(params.batch.status);

	return {
		hero: {
			statusLabel: BATCH_STATUS_LABELS[params.batch.status],
			statusDescription: BATCH_STATUS_DESCRIPTIONS[params.batch.status],
			dayLabel: batchDayLabel(params.batch.status, daysElapsed),
			recipeStep: phaseRecipeStep(params.batch.status),
			nextAction: tasks[0]?.label ?? 'Review the batch summary and update the log as needed.',
			progressPct: round((phaseIndex / (BATCH_STATUS_ORDER.length - 1)) * 100, 0)
		},
		metrics: {
			currentGravity,
			gravityTrend: trendFromValues(currentGravity, previous?.gravity ?? null, 0.0005),
			currentTemperatureC,
			temperatureTrend: trendFromValues(currentTemperatureC, previous?.temperatureC ?? null, 0.1),
			estimatedAbvPct
		},
		summary: {
			originalGravity,
			targetFinalGravity,
			currentGravity,
			estimatedAbvPct,
			attenuationPct,
			daysElapsed
		},
		phaseProgress: BATCH_STATUS_ORDER.map((status) => ({
			status,
			label: BATCH_STATUS_LABELS[status],
			state:
				BATCH_STATUS_ORDER.indexOf(status) < phaseIndex
					? 'complete'
					: status === params.batch.status
						? 'current'
						: 'upcoming'
		})),
		tasks,
		alerts: buildAlerts({
			status: params.batch.status,
			currentGravity,
			targetFinalGravity,
			currentTemperatureC,
			yeastMinC: Number.isFinite(yeastMinC ?? NaN) ? yeastMinC : null,
			yeastMaxC: Number.isFinite(yeastMaxC ?? NaN) ? yeastMaxC : null,
			telemetryCount: params.batch.telemetry.length
		}),
		timeline: buildTimeline(params.batch, params.activity),
		chart: {
			points,
			hasData: points.some((point) => point.gravity != null || point.temperatureC != null)
		}
	} satisfies BatchDashboardState;
}
