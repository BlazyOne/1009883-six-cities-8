import { PipelineStage, Types } from 'mongoose';

export function getIsFavoriteAggregation(userId?: string) {
  let favAggregation: PipelineStage[] = [];

  if (userId) {
    favAggregation = [
      {
        $lookup: {
          from: 'users',
          pipeline: [
            {
              $match: {
                _id: new Types.ObjectId(userId),
              },
            },
            { $project: { favorites: 1 } },
          ],
          as: 'currentUserLookup',
        },
      },
      {
        $addFields: {
          currentUser: { $arrayElemAt: ['$currentUserLookup', 0] },
        },
      },
      {
        $addFields: {
          isFavorite: { $in: ['$_id', '$currentUser.favorites'] },
        },
      },
      { $unset: 'currentUserLookup' },
      { $unset: 'currentUser' },
    ];
  } else {
    favAggregation = [
      {
        $addFields: {
          isFavorite: false,
        },
      },
    ];
  }

  return favAggregation;
}

export const generalOfferAggregation = [
  {
    $lookup: {
      from: 'comments',
      let: { offerId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$offer', '$$offerId'] } } },
        { $project: { rating: 1 } },
      ],
      as: 'comments',
    },
  },
  {
    $lookup: {
      from: 'users',
      let: { authorId: '$author' },
      pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$authorId'] } } }],
      as: 'authorlookup',
    },
  },
  {
    $addFields: {
      id: { $toString: '$_id' },
      commentsCount: { $size: '$comments' },
      rating: { $avg: '$comments.rating' },
      author: { $arrayElemAt: ['$authorlookup', 0] },
    },
  },
  { $unset: 'comments' },
  { $unset: 'authorlookup' },
];